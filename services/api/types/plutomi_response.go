package types



type BasePlutomiResponse struct {
    Message string `json:"message"`
   	DocsUrl string `json:"docs_url"`
}

type PlutomiHealthCheckResponse struct {
    BasePlutomiResponse
    MySQL bool `json:"mysql"`
	Kafka bool `json:"kafka"`
	Redis bool `json:"redis"`
}


