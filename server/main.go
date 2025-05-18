package main

import (
	"log"
	"os"

	"habit-tracker/server/db"
	"habit-tracker/server/handlers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database connection
	db.Init()
}

func main() {
	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		// User routes
		api.GET("/users", handlers.GetUsers)
		api.GET("/users/:id", handlers.GetUserById)
		api.POST("/users", handlers.CreateUser)
		api.PATCH("/users/:id", handlers.UpdateUser)

		// Task routes
		api.GET("/tasks", handlers.GetTasks)
		api.GET("/tasks/user/:userId", handlers.GetTasksByUserId)
		api.GET("/tasks/streak/:userId", handlers.GetUserStreak)
		api.POST("/tasks", handlers.CreateTask)
		api.PATCH("/tasks/:id", handlers.UpdateTask)
		api.DELETE("/tasks/:id", handlers.DeleteTask)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
