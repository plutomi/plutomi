module plutomi/api

go 1.23.1

require (
	github.com/go-chi/chi v1.5.5
	github.com/go-chi/chi/v5 v5.1.0
	github.com/go-chi/render v1.0.3
	go.uber.org/zap v1.27.0
	plutomi/shared v0.0.0-00010101000000-000000000000
)

require (
	github.com/ajg/form v1.5.1 // indirect
	github.com/axiomhq/axiom-go v0.21.1 // indirect
	github.com/cenkalti/backoff/v4 v4.3.0 // indirect
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/go-logr/logr v1.4.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/klauspost/compress v1.17.9 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.55.0 // indirect
	go.opentelemetry.io/otel v1.30.0 // indirect
	go.opentelemetry.io/otel/metric v1.30.0 // indirect
	go.opentelemetry.io/otel/trace v1.30.0 // indirect
	go.uber.org/multierr v1.10.0 // indirect
)

replace plutomi/shared => ../shared
