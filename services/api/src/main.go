package main

import "fmt"

type User struct {
	Name      string
	Suspended bool
}

func main() {
	user := User{
		Name:      "John Doe",
		Suspended: false,
	}

	// Print the user's information (optional)
	fmt.Println("User:", user) // Output: User: {John Doe false}

	// You can now work with the user variable in your main function
	if user.Suspended {
		fmt.Println("User is suspended.")
		return
	}
}
