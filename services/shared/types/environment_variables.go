package types

type EnvironmentVariables struct {
	Environment  string `json:"environment"`
	Port         string `json:"port"`
	MySQLUrl     string `json:"mysql_url"`
	BaseWebUrl   string `json:"base_web_url"`
	AxiomDataset string `json:"axiom_dataset"`
	AxiomToken   string `json:"axiom_token"`
	AxiomOrgId   string `json:"axiom_org_id"`
}
