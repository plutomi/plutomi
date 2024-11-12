package constants

import (
	"log"

	gonanoid "github.com/matoous/go-nanoid"
)

// TODO remove 0, O, I, l, 1 B and 8?
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const idLength = 12

func GenerateID(length int) string {
	id, err := gonanoid.Generate(alphabet, idLength)
	if err != nil {
		log.Fatal("Failed to generate ID")

	}

	return id
}
