package events


type PlutomiEnvelope struct {
	EventType string `json:"event_type"`
	Version  string `json:"version"`
	Data    interface{} `json:"data"`
}
