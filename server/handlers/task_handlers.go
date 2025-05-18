package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"habit-tracker/server/db"
	"habit-tracker/server/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetTasks returns all tasks, optionally filtered by date and user_id
func GetTasks(c *gin.Context) {
	filter, err := buildTaskFilter(c)
	if err != nil {
		return
	}

	tasks, err := fetchTasksWithFilter(c, filter)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// buildTaskFilter constructs a MongoDB filter based on query parameters
func buildTaskFilter(c *gin.Context) (bson.M, error) {
	filter := bson.M{}

	if date := c.Query("date"); date != "" {
		filter["date"] = date
	}

	if userID := c.Query("user_id"); userID != "" {
		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			SendBadRequest(c, "Invalid user ID", err)
			return nil, err
		}
		filter["user_id"] = objectID
	}

	return filter, nil
}

// fetchTasksWithFilter retrieves tasks based on the provided filter
func fetchTasksWithFilter(c *gin.Context, filter bson.M) ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.TaskColl.Find(ctx, filter)
	if err != nil {
		SendInternalError(c, err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []models.Task
	if err = cursor.All(ctx, &tasks); err != nil {
		SendInternalError(c, err)
		return nil, err
	}

	return tasks, nil
}

// GetTasksByUserId returns tasks for a specific user
func GetTasksByUserId(c *gin.Context) {
	userID, err := validateAndGetUserID(c)
	if err != nil {
		return
	}

	tasks, err := fetchTasksWithFilter(c, bson.M{"userId": userID})
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// CreateTask creates a new task
func CreateTask(c *gin.Context) {
	task, err := parseAndValidateTask(c)
	if err != nil {
		return
	}

	if err := validateUserExists(c, task.UserID); err != nil {
		return
	}

	createdTask, err := insertTask(c, task)
	if err != nil {
		return
	}

	c.JSON(http.StatusCreated, createdTask)
}

// parseAndValidateTask parses and validates the task from the request body
func parseAndValidateTask(c *gin.Context) (models.Task, error) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		SendBadRequest(c, "Invalid request body", err)
		return models.Task{}, err
	}

	if task.Date == "" {
		task.Date = time.Now().Format(time.RFC3339)
	}
	task.CreatedAt = time.Now()

	return task, nil
}

// validateUserExists checks if the user exists in the database
func validateUserExists(c *gin.Context, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := db.UserColl.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			SendNotFound(c, "User not found")
			return err
		}
		SendInternalError(c, err)
		return err
	}
	return nil
}

// insertTask inserts a new task into the database
func insertTask(c *gin.Context, task models.Task) (models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.TaskColl.InsertOne(ctx, task)
	if err != nil {
		SendInternalError(c, err)
		return models.Task{}, err
	}

	task.ID = result.InsertedID.(primitive.ObjectID)
	return task, nil
}

// UpdateTask updates a task
func UpdateTask(c *gin.Context) {
	taskID, err := validateAndGetTaskID(c)
	if err != nil {
		return
	}

	updateData, err := parseUpdateData(c)
	if err != nil {
		return
	}

	updatedTask, err := performTaskUpdate(c, taskID, updateData)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, updatedTask)
}

// validateAndGetTaskID validates the task ID from the request
func validateAndGetTaskID(c *gin.Context) (primitive.ObjectID, error) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		SendBadRequest(c, "Invalid task ID", err)
		return primitive.NilObjectID, err
	}
	return objectID, nil
}

// parseUpdateData parses and validates the update data from the request body
func parseUpdateData(c *gin.Context) (bson.M, error) {
	var updateData struct {
		Name      *string `json:"name"`
		Completed *bool   `json:"completed"`
		Date      *string `json:"date"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SendBadRequest(c, "Invalid request body", err)
		return nil, err
	}

	updateFields := bson.M{}
	if updateData.Name != nil {
		updateFields["name"] = *updateData.Name
	}
	if updateData.Completed != nil {
		updateFields["completed"] = *updateData.Completed
	}
	if updateData.Date != nil {
		updateFields["date"] = *updateData.Date
	}

	if len(updateFields) == 0 {
		SendBadRequest(c, "No valid fields to update", nil)
		return nil, fmt.Errorf("no valid fields to update")
	}

	return bson.M{"$set": updateFields}, nil
}

// performTaskUpdate executes the task update in the database
func performTaskUpdate(c *gin.Context, taskID primitive.ObjectID, update bson.M) (models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedTask models.Task
	err := db.TaskColl.FindOneAndUpdate(
		ctx,
		bson.M{"_id": taskID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedTask)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			SendNotFound(c, "Task not found")
			return models.Task{}, err
		}
		SendInternalError(c, err)
		return models.Task{}, err
	}

	return updatedTask, nil
}

// DeleteTask deletes a task
func DeleteTask(c *gin.Context) {
	taskID, err := validateAndGetTaskID(c)
	if err != nil {
		return
	}

	if err := performTaskDeletion(c, taskID); err != nil {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

// performTaskDeletion executes the task deletion in the database
func performTaskDeletion(c *gin.Context, taskID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.TaskColl.DeleteOne(ctx, bson.M{"_id": taskID})
	if err != nil {
		SendInternalError(c, err)
		return err
	}

	if result.DeletedCount == 0 {
		SendNotFound(c, "Task not found")
		return fmt.Errorf("task not found")
	}

	return nil
}

// dateTaskInfo represents the completion status of tasks for a specific date
type dateTaskInfo struct {
	total     int
	completed int
	frozen    bool
}

// GetUserStreak returns the current streak of completed tasks for a user.
// A streak is maintained when all non-frozen tasks are completed for consecutive days.
func GetUserStreak(c *gin.Context) {
	userID, err := validateAndGetUserID(c)
	if err != nil {
		return
	}

	tasks, err := fetchUserTasks(c, userID)
	if err != nil {
		return
	}

	dateTasks := groupTasksByDate(tasks)
	streak := calculateStreak(dateTasks)

	c.JSON(http.StatusOK, gin.H{
		"streak":  streak,
		"user_id": userID.Hex(),
	})
}

// validateAndGetUserID validates the user ID from the request and returns the ObjectID
func validateAndGetUserID(c *gin.Context) (primitive.ObjectID, error) {
	userID := c.Param("userId")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		SendBadRequest(c, "Invalid user ID", err)
		return primitive.NilObjectID, err
	}
	return objectID, nil
}

// fetchUserTasks retrieves all tasks for a given user
func fetchUserTasks(c *gin.Context, userID primitive.ObjectID) ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.TaskColl.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		SendInternalError(c, err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []models.Task
	if err = cursor.All(ctx, &tasks); err != nil {
		SendInternalError(c, err)
		return nil, err
	}
	return tasks, nil
}

// groupTasksByDate organizes tasks by date and tracks their completion status
func groupTasksByDate(tasks []models.Task) map[string]dateTaskInfo {
	dateTasks := make(map[string]dateTaskInfo)

	for _, task := range tasks {
		dateStr := task.Date[:10] // Get YYYY-MM-DD format
		info := dateTasks[dateStr]
		info.total++

		if strings.Contains(strings.ToLower(task.Name), "frozen") {
			info.frozen = true
		} else if task.Completed {
			info.completed++
		}
		dateTasks[dateStr] = info
	}

	return dateTasks
}

// calculateStreak determines the current streak of completed tasks
func calculateStreak(dateTasks map[string]dateTaskInfo) int {
	streak := 0
	currentDate := time.Now()

	// Check today's tasks
	dateStr := currentDate.Format(time.RFC3339)[:10]
	if info := dateTasks[dateStr]; !info.frozen && info.completed == info.total {
		streak++
	}

	// Check previous days
	for {
		currentDate = currentDate.AddDate(0, 0, -1)
		dateStr := currentDate.Format(time.RFC3339)[:10]
		info := dateTasks[dateStr]

		// Break streak if no tasks or incomplete tasks
		if info.total == 0 || (!info.frozen && info.completed < info.total) {
			break
		}

		// Only count days where all tasks are completed
		if !info.frozen && info.completed == info.total {
			streak++
		}
	}

	return streak
}

// DeleteFrozenTasks deletes all frozen tasks for a specific date
func DeleteFrozenTasks(c *gin.Context) {
	date := c.Query("date")
	userID := c.Query("user_id")

	if date == "" || userID == "" {
		SendBadRequest(c, "Date and user_id are required", nil)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create filter to match frozen tasks for the specific date and user
	filter := bson.M{
		"user_id": objectID,
		"date":    date,
		"name":    bson.M{"$regex": "frozen", "$options": "i"},
	}

	result, err := db.TaskColl.DeleteMany(ctx, filter)
	if err != nil {
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Frozen tasks deleted successfully",
		"count":   result.DeletedCount,
	})
}
