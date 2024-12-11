package entities

import "time"

type InternalEvent struct {
		ID       int    `db:"id"`
		Type string `db:"task_type"`
		Data string `db:"task_data"`
		CreatedAt time.Time `db:"created_at"`
		UpdatedAt time.Time `db:"updated_at"`
	}
