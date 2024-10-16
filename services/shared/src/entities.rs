pub enum Entities {
    // User,
    // Org,
    // Membership,
    // Workspace,
    // Invite,
    // Application,
    // Stage,
    // We don't need a `Response` entity because Responses will
    // have the Request + ID so for any debugging purposes, we can retrieve
    // everything for a request including the response, by using the Request ID
    Request,
    // Webhook,
    // ApiKey,
    // Response,
    // Note,
}
impl Entities {
    pub fn as_prefix(&self) -> String {
        let prefix = match self {
            // Entities::User => "usr_",
            // Entities::Org => "org_",
            // Entities::Membership => "mbr_",
            // Entities::Workspace => "wsp_",
            // Entities::Invite => "inv_",
            // Entities::Note => "nte_",
            // Entities::Application => "app_",
            // Entities::Stage => "stg_",
            Entities::Request => "rq_",
            // Entities::Response => "rs_",
            // Entities::Webhook => "whk_",
            // Entities::ApiKey => "plutomi_api_key_",
        };

        prefix.to_string()
    }
}

pub mod user;
