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

// GetTasks returns all tasks, optionally filtered by date
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get filters from query parameters
	date := c.Query("date")
	userID := c.Query("user_id")

	// Build filter
	filter := bson.M{}
	if date != "" {
		filter["date"] = date
	}
	if userID != "" {
		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			SendBadRequest(c, "Invalid user ID", err)
			return
		}
		filter["user_id"] = objectID
	}

	cursor, err := db.TaskColl.Find(ctx, filter)
	if err != nil {
		SendInternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &tasks); err != nil {
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetTasksByUserId returns tasks for a specific user
func GetTasksByUserId(c *gin.Context) {
	userID := c.Param("userId")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	var tasks []models.Task
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.TaskColl.Find(ctx, bson.M{"userId": objectID})
	if err != nil {
		SendInternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &tasks); err != nil {
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// CreateTask creates a new task
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		SendBadRequest(c, "Invalid request body", err)
		return
	}

	// Verify user exists
	userID, err := primitive.ObjectIDFromHex(task.UserID.Hex())
	if err != nil {
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err = db.UserColl.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			SendNotFound(c, "User not found")
			return
		}
		SendInternalError(c, err)
		return
	}

	task.CreatedAt = time.Now()
	if task.Date == "" {
		task.Date = time.Now().Format(time.RFC3339)
	}

	result, err := db.TaskColl.InsertOne(ctx, task)
	if err != nil {
		SendInternalError(c, err)
		return
	}

	task.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, task)
}

// UpdateTask updates a task
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		SendBadRequest(c, "Invalid task ID", err)
		return
	}

	var updateData struct {
		Name      *string `json:"name"`
		Completed *bool   `json:"completed"`
		Date      *string `json:"date"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		SendBadRequest(c, "Invalid request body", err)
		return
	}

	// Only include non-nil fields in the update
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

	// If no fields to update, return bad request
	if len(updateFields) == 0 {
		SendBadRequest(c, "No valid fields to update", nil)
		return
	}

	update := bson.M{
		"$set": updateFields,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedTask models.Task
	err = db.TaskColl.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedTask)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			SendNotFound(c, "Task not found")
			return
		}
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, updatedTask)
}

// DeleteTask deletes a task
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		SendBadRequest(c, "Invalid task ID", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.TaskColl.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		SendInternalError(c, err)
		return
	}

	if result.DeletedCount == 0 {
		SendNotFound(c, "Task not found")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

// GetUserStreak returns the current streak of completed tasks for a user
func GetUserStreak(c *gin.Context) {
	userID := c.Param("userId")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all tasks for the user
	filter := bson.M{
		"user_id": objectID,
	}

	cursor, err := db.TaskColl.Find(ctx, filter)
	if err != nil {
		SendInternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var tasks []models.Task
	if err = cursor.All(ctx, &tasks); err != nil {
		SendInternalError(c, err)
		return
	}

	// Group tasks by date and track completion status
	dateTasks := make(map[string]struct {
		total     int
		completed int
		frozen    bool
	})

	for _, task := range tasks {
		dateStr := task.Date[:10] // Get YYYY-MM-DD format
		dateInfo := dateTasks[dateStr]
		dateInfo.total++
		if strings.Contains(strings.ToLower(task.Name), "frozen") {
			dateInfo.frozen = true
		} else if task.Completed {
			dateInfo.completed++
		}
		dateTasks[dateStr] = dateInfo
	}

	// Calculate streak
	streak := 0
	currentDate := time.Now()

	// Check consecutive days backwards from today
	for {
		dateStr := currentDate.Format(time.RFC3339)[:10] // Get YYYY-MM-DD format
		dateInfo := dateTasks[dateStr]
		fmt.Printf("Checking date: %s, total: %d, completed: %d, frozen: %v\n", dateStr, dateInfo.total, dateInfo.completed, dateInfo.frozen)
		// If the date has no tasks or is not frozen and not all tasks are completed, break the streak
		if dateInfo.total == 0 || (!dateInfo.frozen && dateInfo.completed < dateInfo.total && currentDate != time.Now()) {
			break
		}

		// Only increment streak for dates where all tasks are completed (not frozen)
		if !dateInfo.frozen && dateInfo.completed == dateInfo.total {
			streak++
		}

		currentDate = currentDate.AddDate(0, 0, -1)
	}

	c.JSON(http.StatusOK, gin.H{
		"streak":  streak,
		"user_id": userID,
	})
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
