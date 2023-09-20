package models

import "gorm.io/gorm"

type Fetched struct {
	gorm.Model

	ID     uint `gorm:"primaryKey;autoIncrement"`
	UserID uint `gorm:"not null"`
	FileID uint `gorm:"not null"`
}
