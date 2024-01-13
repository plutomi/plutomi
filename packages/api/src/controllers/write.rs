use std::collections::HashMap;

use crate::{
    utils::{
        generate_id::{Entities, PlutomiId},
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use mongodb::bson::to_document;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Debug)]
struct Book {
    _id: String,
    index: u32,
    guid: String,
    is_active: bool,
    balance: String,
    picture: String,
    age: u32,
    eye_color: String,
    gender: String,
    name: String,
    company: String,
    email: String,
    phone: String,
    address: String,
    address2: String,
    address3: String,
    address4: String,
    about: String,
    registered: String,
    latitude: f64,
    longitude: f64,
    tags: Vec<String>,
    friends: Vec<HashMap<String, String>>,
    greeting: String,
    favorite_fruit: String,
}

#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn write(
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    State(state): State<AppState>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    // let _x = state.mongodb.collection.find_one(None, None).await.is_ok();

    let book = Book {
          _id: PlutomiId::new(&OffsetDateTime::now_utc(), Entities::Book),
          index: 0,
          guid: "a79af82c-e6de-40e2-9cb4-970781f6e2c4".to_string(),
          is_active: false,
          balance: "$2,209.73".to_string(),
          picture: "http://placehold.it/32x32".to_string(),
          age: 35,
          eye_color: "brown".to_string(),
          name: "Mueller Jordan".to_string(),
          gender: "male".to_string(),
          company: "ILLUMITY".to_string(),
          email: "muellerjordan@illumity.com".to_string(),
        phone: "+1 (968) 573-3952".to_string(),
          address: "489 Howard Avenue, Crayne, Arizona, 302".to_string(),
          address2: "498 Dover Street, Grantville, Northern Mariana Islands, 2156".to_string(),
        address3: "809 Barlow Drive, Marenisco, Tennessee, 5560".to_string(),
          address4: "151 Cass Place, Ruckersville, Hawaii, 3129".to_string(),
          about: "Mollit non do labore nostrud enim laboris cupidatat. Dolor in cupidatat voluptate qui velit sint cupidatat. Duis cillum ad qui ut dolore tempor nulla fugiat. Occaecat ea deserunt elit exercitation ex aliqua. Est elit aliquip culpa duis commodo non sunt ex culpa eiusmod duis magna proident. Aliquip anim nostrud cupidatat aliquip duis occaecat id voluptate exercitation ex aute officia.\r\nAliqua ex et minim reprehenderit veniam cillum sit esse dolor veniam velit officia qui. Cillum aliqua ea mollit excepteur et laborum mollit quis aliquip excepteur aute incididunt. Amet est ullamco commodo esse sit consequat ipsum qui magna Lorem nostrud. Do dolor dolor qui est pariatur ut. Duis anim ea exercitation non anim exercitation et Lorem magna. Quis adipisicing ex excepteur eiusmod pariatur quis.\r\nOccaecat adipisicing duis exercitation incididunt deserunt do pariatur cupidatat fugiat ad ullamco est. Do do sunt ad ex fugiat reprehenderit voluptate magna. Aute amet in officia duis officia officia reprehenderit exercitation exercitation pariatur deserunt eu cillum commodo. Magna in sunt deserunt do nostrud aliqua reprehenderit ut qui.\r\nEst exercitation ipsum occaecat nulla minim amet non aliqua qui et do aliquip et id. Qui magna ut ipsum aliquip reprehenderit cupidatat occaecat irure aliquip velit. Dolor consectetur Lorem voluptate consectetur velit laborum amet dolor. Tempor commodo qui adipisicing proident elit ex officia ad.\r\nLorem Lorem dolore minim deserunt laboris cupidatat reprehenderit sit eu incididunt aliqua culpa qui. Et in id laborum ex. Tempor aliqua et ipsum nostrud eu ex et. Cupidatat excepteur et nulla duis ullamco ut tempor quis.\r\nIncididunt nulla esse est deserunt dolor sint consequat sint anim culpa. Sit consectetur dolor culpa minim sint dolore aliquip duis reprehenderit nulla duis. Qui pariatur sint exercitation in magna id laborum fugiat est.\r\nIpsum laborum sint culpa aute aliquip. Tempor ut est adipisicing labore mollit esse. Dolor velit sint incididunt excepteur exercitation deserunt do nulla excepteur do deserunt enim ad cillum. Cupidatat aliquip labore consequat ea magna ipsum aliqua excepteur nostrud nisi ea. Consectetur ut est pariatur pariatur aute deserunt sint cillum nisi commodo laborum. Cupidatat qui laborum nulla ex magna irure in do eiusmod commodo incididunt.\r\nSint esse dolore dolore aute reprehenderit cillum Lorem. Aute excepteur qui ullamco sit. Laborum id culpa voluptate non esse ex. Est ullamco ad velit veniam enim Lorem aliqua incididunt labore dolor nulla. Minim veniam ut dolore proident amet in sit eiusmod cillum anim consequat est excepteur. Id amet ipsum eiusmod fugiat incididunt.\r\nDolor cupidatat qui esse velit nisi excepteur commodo amet id ut esse et irure. Cillum pariatur elit nisi pariatur. Eiusmod quis ullamco in eu commodo amet et excepteur.\r\nConsequat elit enim duis id est dolor voluptate incididunt exercitation ad. Consequat non elit consequat qui. Fugiat sint laborum irure occaecat duis est proident. Nostrud ex aute minim occaecat velit sint eiusmod dolore nostrud ad. Et cupidatat cillum eu eu ut est id sint magna aliquip excepteur deserunt. Ipsum id nostrud incididunt velit.\r\nMagna ex consectetur voluptate laborum voluptate laboris esse labore commodo amet consequat sunt. Eu anim tempor duis adipisicing in Lorem ullamco ullamco ullamco anim in. Proident officia voluptate ipsum veniam sit dolore id aute excepteur duis exercitation nostrud proident.\r\nAliqua aliqua ullamco est in elit officia proident laboris in cupidatat culpa. Irure eiusmod commodo voluptate aliquip labore cupidatat eu est dolor. Dolore deserunt nisi non nisi quis voluptate ea labore. Adipisicing nostrud ipsum est labore veniam sunt enim consequat commodo magna cillum aliqua commodo incididunt. Est do ullamco aliquip ad non enim ipsum quis. Minim enim commodo fugiat elit culpa magna fugiat occaecat ex incididunt.\r\nMollit quis culpa fugiat aute in fugiat anim aliquip consectetur mollit. Laboris mollit magna non ea magna ad do cillum. Consectetur sit est enim commodo id commodo ullamco ea sint. Non cupidatat et laborum ea sint irure velit quis laboris ad aliqua.\r\nEsse ea cillum aliqua fugiat nostrud nulla fugiat nisi reprehenderit consequat Lorem aute. Commodo aliquip sint ad reprehenderit duis laborum do labore irure mollit eu laboris. Sunt ullamco consectetur non cupidatat adipisicing id magna non ut dolore exercitation ea aute.\r\nEiusmod mollit adipisicing aliquip nulla culpa sit sunt. Incididunt minim Lorem nulla dolore culpa dolor adipisicing duis exercitation ullamco enim elit. Id ad in minim in. Aliqua sunt consectetur consequat ad id.\r\nDolore laborum aliqua qui consequat mollit aliqua voluptate pariatur quis nulla nisi ea ullamco minim. Labore in dolor sint elit aliquip. Nulla elit tempor reprehenderit aliqua adipisicing aliquip anim adipisicing pariatur. Aliqua eu magna enim ullamco. Laboris veniam irure deserunt nulla sint mollit dolor. Anim velit tempor adipisicing velit magna laborum est est minim velit. Anim ex irure fugiat aliquip tempor tempor occaecat irure ex sunt aliquip ullamco anim velit.\r\nDolore laborum ipsum reprehenderit nostrud ullamco nisi est ipsum sunt. Irure dolore non qui est dolore aliquip est. Do anim tempor aliquip consectetur. Et cillum ut culpa cupidatat aute eiusmod laboris quis pariatur.\r\nTempor irure dolor nulla veniam id non quis mollit cupidatat sunt ex ipsum. Excepteur eu irure Lorem cupidatat. Enim eu anim esse incididunt reprehenderit. Excepteur tempor officia esse eiusmod ut ut fugiat dolore non dolor commodo elit proident magna.\r\nAliquip ipsum nostrud ea eiusmod consectetur dolore nostrud. Officia aute ad minim minim ea ullamco anim cupidatat adipisicing. Anim adipisicing officia laborum nostrud velit. Cupidatat ea veniam in incididunt amet eu laborum sint incididunt mollit.\r\nLabore ea sit incididunt minim ea proident qui incididunt amet dolore adipisicing. Minim velit non eiusmod duis nisi incididunt aute magna non aliqua ipsum. Voluptate ut enim sint cupidatat ullamco amet non occaecat. Non do voluptate dolore nulla exercitation irure eu aute consectetur dolore laborum ipsum. Ut consectetur ullamco enim ullamco do veniam tempor consectetur.\r\n".to_string(),
          registered: "2014-09-28T02:07:08 +04:00".to_string(),
          latitude: -68.419931,
          longitude: 153.17297,
          tags: vec![
            "reprehenderit ex qui dolore ipsum proident fugiat anim duis occaecat".to_string(),
            "ea aute ea sint voluptate occaecat eu proident sunt ipsum".to_string(),
            "incididunt irure ex elit Lorem incididunt non est nisi veniam".to_string(),
            "nisi id aliqua aute nulla aute dolore culpa pariatur ullamco".to_string(),
            "culpa ullamco velit exercitation fugiat laboris duis duis voluptate cillum".to_string(),
            "excepteur nisi deserunt duis duis eiusmod deserunt proident tempor labore".to_string(),
            "culpa ad aliqua anim pariatur ea Lorem amet nisi voluptate".to_string()
          ],
          friends: vec![
            {
                let mut friend = HashMap::new();
                friend.insert("id".to_string(), "0".to_string());
                friend.insert("name".to_string(), "James Boyle".to_string());
                friend
            },
            {
                let mut friend = HashMap::new();
                friend.insert("id".to_string(), "1".to_string());
                friend.insert("name".to_string(), "Murphy Soto".to_string());
                friend
            },
            {
                let mut friend = HashMap::new();
                friend.insert("id".to_string(), "2".to_string());
                friend.insert("name".to_string(), "Amie Fuller".to_string());
                friend
            },
        ],
          greeting: "Hello, Mueller Jordan! You have 6 unread messages.".to_string(),
          favorite_fruit: "banana".to_string()
    };

    println!("Book: {:?}", book);

    // Insert the book directly
    let insert_one_result = state
        .mongodb
        .collection
        .insert_one(to_document(&book).unwrap(), None)
        .await
        .unwrap();

    println!("Inserted book with id {:?}", insert_one_result.inserted_id);
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database: true,
        environment: state.env.NEXT_PUBLIC_ENVIRONMENT,
    };

    state.logger.log(LogObject {
        level: match true {
            true => LogLevel::Info,
            false => LogLevel::Error,
        },
        _time: iso_format(OffsetDateTime::now_utc()),
        message: "Inserted 1".to_string(),
        data: None,
        error: None,
        request: Some(json!(request_as_hashmap)),
        response: Some(json!(&response)),
    });

    (StatusCode::OK, Json(response))
}
