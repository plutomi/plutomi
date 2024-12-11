package entities

import "time"



type InternalTask struct {
		ID       int    `db:"id"`
		Type string `db:"type"`
		Data string `db:"data"`
		State string `db:"state"`
		CreatedAt time.Time `db:"created_at"`
		UpdatedAt time.Time `db:"updated_at"`
	}
