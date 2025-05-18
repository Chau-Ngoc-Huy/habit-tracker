package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name" validate:"required"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"password_hash" json:"password_hash" validate:"required"`
	Streak       int                `bson:"streak" json:"streak"`
	AvatarURL    string             `bson:"avatar_url" json:"avatarURL"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}

type Task struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name      string             `bson:"name" json:"name"`
	Completed bool               `bson:"completed" json:"completed"`
	Date      string             `bson:"date" json:"date"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
