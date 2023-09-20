package models

import "gorm.io/gorm"

type Account struct {
	gorm.Model

	ID       uint   `gorm:"primaryKey;autoIncrement"`
	User     string `gorm:"not null;unique_index"`
	Name     string `gorm:"not null"`
	Password string `gorm:"not null"`
	Mail     string `gorm:"not null"`
	ClientID string `gorm:"not null"`
}
