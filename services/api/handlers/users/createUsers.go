package users

import (
	"encoding/json"
	"net/http"
	"plutomi/api/types"
	utils "plutomi/shared/utils"

	"github.com/go-chi/render"
)

type DBUser struct {
	ID       int    `db:"id" json:"id"`
	Username string `db:"username" json:"username"`
	Email    string `db:"email" json:"email"`
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}

type PlutomiUserCreatedResponse struct {
	Message string `json:"message"`
	User    []DBUser `json:"user"`
}

func CreateUsers(w http.ResponseWriter, r *http.Request, ctx *utils.AppContext) {
	var req CreateUserRequest

	// Parse JSON from request body

	err := json.NewDecoder(r.Body).Decode(&req)
if err != nil {
	render.Status(r, http.StatusBadRequest)
	render.JSON(w, r, types.BasePlutomiResponse{
		Message: "Invalid request body when creating a user",
		DocsUrl: "https://plutomi.com/docs/api/users/create",
	})
	return
}

	// Prepare statement for inserting user into database
	_, err = ctx.MySQL.Exec("INSERT INTO users (username, email) VALUES (?, ?)", req.Username, req.Email)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to insert",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}


	rows, err := ctx.MySQL.Queryx("SELECT * FROM users")
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		res := types.BasePlutomiResponse{
			Message: "Failed to retrieve created user",
			DocsUrl: "https://plutomi.com/docs/api/users/create",
		}
		render.JSON(w, r, res)
		return
	}
	defer rows.Close()

	var users []DBUser


	for rows.Next() {
		var u DBUser
		err := rows.StructScan(&u)
		if err != nil {
			render.Status(r, http.StatusInternalServerError)
			res := types.BasePlutomiResponse{
				Message: "Failed to retrieve created user",
				DocsUrl: "https://plutomi.com/docs/api/users/create",
			}
			render.JSON(w, r, res)
			return
		}
		users = append(users, u)
	}

	//Prepare the response
	res := PlutomiUserCreatedResponse{
		Message: "User created successfully",
		User:    users,
	}

	render.Status(r, http.StatusCreated)
	render.JSON(w, r, res)
}
