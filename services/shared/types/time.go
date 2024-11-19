package types

import "time"


type JSONTime time.Time

// JSONTime is a custom type that wraps time.Time.
// This allows us to define custom JSON marshaling behavior
// while still retaining all the functionality of time.Time.
func (t JSONTime) MarshalJSON() ([]byte, error) {
    // Convert the JSONTime back to a standard time.Time type.
    // This is necessary because we're adding methods to JSONTime,
    // but we need to use time.Time's methods.
    tt := time.Time(t)

    // Format the time.Time value to a string in RFC3339 format
    // with milliseconds always shown to three decimal places.
    s := tt.UTC().Format("2006-01-02T15:04:05.000Z")

    // Return the formatted time string as a JSON byte slice.
    // We wrap the string in quotes to produce a valid JSON string value.
    return []byte(`"` + s + `"`), nil
}
