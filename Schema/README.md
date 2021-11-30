## DynamoDB Schema

> NOTE: Schema is subject to change but I will try to keep this updated as much as I can

We're using a single table design for this project. If you're new to Dynamo, I recommend watching these talks by Alex DeBrie and Rick Houlihan first.

Here are a few:

- Alex DeBrie @ re:Invent 2020 - [Data modeling with Amazon DynamoDB – Part 1](https://www.youtube.com/watch?v=fiP2e-g-r4g)
- Alex DeBrie @ re:Invent 2020 -[ Data modeling with Amazon DynamoDB – Part 2](https://www.youtube.com/watch?v=0uLF1tjI_BI)

- Rick Houlihan @ re:invent 2018 - [Advanced Design Patterns for DynamoDB (DAT401)](https://www.youtube.com/watch?v=HaEPXoXVf2k)
- Rick Houlihan @ re:invent 2019 - [Advanced design patterns for DynamoDB (DAT403-R1)](https://www.youtube.com/watch?v=6yqfmXiZTlM)

Also, don't forget to buy **THE** [DynamoDB Book](https://www.dynamodbbook.com/) by Alex ;)

To create & edit your data models locally, I suggest downloading [NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html). The files [CloudFormation.json](CloudFormation.json) and [NoSQLWorkbench.json](NoSQLWorkbench.json) are direct outputs from it that have the current schema. The Workbench tool also allows you to easily visualize your schema, export the table to your AWS account, and even generate queries in Python, JavaScript, or Java.

I've created a handy spreadsheet with access patterns and use cases, you can [view it here](https://docs.google.com/spreadsheets/d/1KZMJt0X2J0s1v8_jz6JC7aiiwYW8qVV9pKWobQ5012Y/edit?usp=sharing). It helps to follow along with NoSQL Workbench on your own machine or you can view the pictures next to this README.

You might have noticed that _some_ sort keys (SK, GSI1SK, GSI2SK) have the `entity type` prefixed (e.g. `ORG_ROLE`). This is intentional and it's so we can retrieve these sub-entities when doing a query on the parent.
For example, when retrieving an `org`, we might want to get all of the `roles` for that org as well. We can do one query with `PK = orgId and SK = begins_with(ORG)` :)

Some partitions will [need to be sharded](https://youtu.be/_KNrRdWD25M?t=581) in the future, specially for high throughput items at millions of items scale (get all applicants in an org, in a stage, in an opening, all webhook history, etc.). Not going to bother with that for now but it _is_ on my radar!

Also another thing to note, items that can be _rearranged_ such as stages, stage questions, stage rules, etc. have a limit on how many of these items can be created. Since we have to store the itemId in the parent to preserve the order, we have to make sure we don't go over Dynamo's 400kb limit on the parent. This shouldn't be an issue as if you have more than (whatever the default is at the time) questions per stage, or stages per opening, something is.. seriously wrong. It is a soft limit, but it's so things can stay performant.
