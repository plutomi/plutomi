x

	// Prepare statement for inserting user into database
	stmt, err := ctx.MySQL.Preparex("INSERT INTO users (username, email) VALUES (?, ?)")
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to prepare statement",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}
	defer stmt.Close()

	// Execute the prepared statement
	result, err := stmt.Exec(req.Username, req.Email)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to insert user",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}

	// Retrieve the ID of the last inserted user
	userId, err := result.LastInsertId()
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to retrieve last inserted ID",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}

	// Query for the newly created user
	var createdUser DBUser
	err = ctx.MySQL.Get(&createdUser, "SELECT id, username, email FROM users WHERE id = ?", userId)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to retrieve created user",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}

	// Prepare the response
	res := PlutomiUserCreatedResponse{
		Message: "User created successfully",
		User:    createdUser,
	}

	render.Status(r, http.StatusCreated)
	render.JSON(w, r, res)
}
