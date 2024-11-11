package shared

type PlutomiResponse struct {
	Message string `json:"message"`
	DocsUrl string `json:"docs_url"`
}

type EnvironmentVariables struct {
	Environment string
	Port        string
}
