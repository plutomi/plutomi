package events

type TOTPRequested struct {
	Email string `json:"email"`
}
