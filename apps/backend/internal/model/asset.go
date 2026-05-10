package model

import "time"

// Asset represents an uploaded image or file
type Asset struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Mime      string    `db:"mime" json:"mime"`
	Size      int64     `db:"size" json:"size"`
	Width     int       `db:"width" json:"width"`
	Height    int       `db:"height" json:"height"`
	URL       string    `db:"url" json:"url"`
	ThumbURL  *string   `db:"thumb_url" json:"thumb_url"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
