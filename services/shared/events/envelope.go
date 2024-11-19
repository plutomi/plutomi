package events

type PlutomiEnvelope struct {
	EventType string `json:"event_type"`
	Version   string `json:"version"`
	// All the actual event data
	Data interface{} `json:"data"`
}
