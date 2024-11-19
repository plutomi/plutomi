package events

type PlutomiEnvelope struct {
	// TODO not used
	EventType string `json:"event_type"`
	Version   string `json:"version"`
	// All the actual event data
	Data interface{} `json:"data"`
}
