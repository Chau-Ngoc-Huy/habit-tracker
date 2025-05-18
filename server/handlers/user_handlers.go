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

// GetUsers returns all users
func GetUsers(c *gin.Context) {
	var users []models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.UserColl.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("Error finding users: %v", err)
		SendInternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &users); err != nil {
		log.Printf("Error decoding users: %v", err)
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUserById returns a user by ID
func GetUserById(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Printf("Invalid user ID format: %v", err)
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = db.UserColl.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("User not found with ID: %s", id)
			SendNotFound(c, "User not found")
			return
		}
		log.Printf("Error finding user by ID: %v", err)
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, user)
}

// CreateUser creates a new user
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("Invalid request body for user creation: %v", err)
		SendBadRequest(c, "Invalid request body", err)
		return
	}

	user.CreatedAt = time.Now()
	user.Streak = 0

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.UserColl.InsertOne(ctx, user)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		SendInternalError(c, err)
		return
	}

	user.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, user)
}

// UpdateUser updates a user
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Printf("Invalid user ID format for update: %v", err)
		SendBadRequest(c, "Invalid user ID", err)
		return
	}

	var updateData struct {
		Name   string `json:"name"`
		Streak int    `json:"streak"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("Invalid request body for user update: %v", err)
		SendBadRequest(c, "Invalid request body", err)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"name":   updateData.Name,
			"streak": updateData.Streak,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedUser models.User
	err = db.UserColl.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedUser)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("User not found for update with ID: %s", id)
			SendNotFound(c, "User not found")
			return
		}
		log.Printf("Error updating user: %v", err)
		SendInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, updatedUser)
}
