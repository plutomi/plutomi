package shared

import "go.uber.org/zap"

type PlutomiResponse struct {
	Message string `json:"message"`
	DocsUrl string `json:"docs_url"`
}

type EnvironmentVariables struct {
	Environment string
	Port        string
	Test string
}


type AppContext struct {
	Env    EnvironmentVariables
	Logger *zap.Logger
}
