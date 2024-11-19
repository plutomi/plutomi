package utils

import (
	"log"

	gonanoid "github.com/matoous/go-nanoid"
)

// Removed 0, O, o, I, l, 1, i, B, 8
const alphabet = "2345679abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ"
const idLength = 12

func GenerateID(length int) string {
	id, err := gonanoid.Generate(alphabet, idLength)
	if err != nil {
		log.Fatal("Failed to generate ID")

	}

	return id
}
