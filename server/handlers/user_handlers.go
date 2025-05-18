package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"habit-tracker/server/db"
	"habit-tracker/server/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetUsers returns all users sorted by creation date
func GetUsers(c *gin.Context) {
	users, err := fetchAllUsers(c)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, users)
}

// fetchAllUsers retrieves all users from the database
func fetchAllUsers(c *gin.Context) ([]models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := db.UserColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		log.Printf("Error finding users: %v", err)
		SendInternalError(c, err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		log.Printf("Error decoding users: %v", err)
		SendInternalError(c, err)
		return nil, err
	}

	return users, nil
}

// GetUserById returns a user by ID
func GetUserById(c *gin.Context) {
	userID, err := validateAndGetUserID(c)
	if err != nil {
		return
	}

	user, err := fetchUserByID(c, userID)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, user)
}

// fetchUserByID retrieves a user by their ID
func fetchUserByID(c *gin.Context, userID primitive.ObjectID) (models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := db.UserColl.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("User not found with ID: %s", userID.Hex())
			SendNotFound(c, "User not found")
			return models.User{}, err
		}
		log.Printf("Error finding user by ID: %v", err)
		SendInternalError(c, err)
		return models.User{}, err
	}

	return user, nil
}

// CreateUser creates a new user
func CreateUser(c *gin.Context) {
	user, err := parseAndValidateUser(c)
	if err != nil {
		return
	}

	createdUser, err := insertUser(c, user)
	if err != nil {
		return
	}

	c.JSON(http.StatusCreated, createdUser)
}

// parseAndValidateUser parses and validates the user from the request body
func parseAndValidateUser(c *gin.Context) (models.User, error) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("Invalid request body for user creation: %v", err)
		SendBadRequest(c, "Invalid request body", err)
		return models.User{}, err
	}

	user.CreatedAt = time.Now()
	user.Streak = 0

	return user, nil
}

// insertUser inserts a new user into the database
func insertUser(c *gin.Context, user models.User) (models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.UserColl.InsertOne(ctx, user)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		SendInternalError(c, err)
		return models.User{}, err
	}

	user.ID = result.InsertedID.(primitive.ObjectID)
	return user, nil
}

// UpdateUser updates a user
func UpdateUser(c *gin.Context) {
	userID, err := validateAndGetUserID(c)
	if err != nil {
		return
	}

	updateData, err := parseUserUpdateData(c)
	if err != nil {
		return
	}

	updatedUser, err := performUserUpdate(c, userID, updateData)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, updatedUser)
}

// parseUserUpdateData parses and validates the update data from the request body
func parseUserUpdateData(c *gin.Context) (bson.M, error) {
	var updateData struct {
		Name   string `json:"name"`
		Streak int    `json:"streak"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("Invalid request body for user update: %v", err)
		SendBadRequest(c, "Invalid request body", err)
		return nil, err
	}

	return bson.M{
		"$set": bson.M{
			"name":   updateData.Name,
			"streak": updateData.Streak,
		},
	}, nil
}

// performUserUpdate executes the user update in the database
func performUserUpdate(c *gin.Context, userID primitive.ObjectID, update bson.M) (models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedUser models.User
	err := db.UserColl.FindOneAndUpdate(
		ctx,
		bson.M{"_id": userID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedUser)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("User not found for update with ID: %s", userID.Hex())
			SendNotFound(c, "User not found")
			return models.User{}, err
		}
		log.Printf("Error updating user: %v", err)
		SendInternalError(c, err)
		return models.User{}, err
	}

	return updatedUser, nil
}
