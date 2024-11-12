module plutomi/api

go 1.23.1

require (
	github.com/go-chi/chi/v5 v5.1.0
	github.com/go-chi/render v1.0.3
	go.uber.org/zap v1.27.0
	plutomi/shared v0.0.0-00010101000000-000000000000
)

require (
	github.com/ajg/form v1.5.1 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	go.uber.org/multierr v1.10.0 // indirect
)

replace plutomi/shared => ../shared
