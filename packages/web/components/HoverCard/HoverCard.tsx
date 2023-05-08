import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Typography,
  Grid,
  Form
} from "antd";
import { useState } from "react";
import { colors } from "@/utils";

import type { SizeType } from "antd/es/config-provider/SizeContext";
import { GithubOutlined, TwitterOutlined } from "@ant-design/icons";
import { ExternalLink } from "../ExternalLink/ExternalLink";

const { Text, Paragraph, Title } = Typography;
const buttonSize: SizeType = "large";
const plutomiGithub = "https://github.com/plutomi/plutomi";
const joseTwitter = "https://twitter.com/notjoswayski";

const { useBreakpoint } = Grid;

/* eslint-disable no-template-curly-in-string */

const validateMessages = {
  types: {
    email: "That email doesn't look right..."
  },
  required: "Email is required"
};
/* eslint-enable no-template-curly-in-string */

const onFinish = (values: any) => {
  console.log(values);
};

export const HoverCard: React.FC = () => {
  const screens = useBreakpoint();
  const [inputStatus, setInputStatus] = useState<"default" | "error">("default");

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const siteIsCurrent = `This site is current as of ${today}`;

  const borderSize = 0;

  const checkPrice = (_: any, value: { number: number }) => {
    console.log(`in validator`, value);
    if (Number(value) > 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Price must be greater than zero!"));
  };

  return (
    <Card
      title="Hi there!"
      bordered={false}
      style={{ width: 600, textAlign: "start" }}
    >
      <Space size={6} direction="vertical">
        <Row justify="center" style={{ border: `${borderSize}px solid red` }}>
          <Paragraph>
            To enhance the long term stability of the site, I (Jose) am doing a
            major refactor. You can check the progress and all changes on GitHub
            or DM me on Twitter or by email if you have any questions :)
          </Paragraph>
        </Row>

        <Row justify="center" style={{ border: `${borderSize}px solid blue` }}>
          <Text strong copyable style={{ alignSelf: "center" }}>
            jose@plutomi.com
          </Text>
        </Row>

        <Row
          justify="space-around"
          style={{ paddingTop: "1rem", border: `${borderSize}px solid orange` }}
        >
          <Button size={buttonSize} type="link" href={plutomiGithub}>
            Plutomi on <GithubOutlined style={{ color: colors.github }} />
          </Button>

          <Button size={buttonSize} type="link" href={joseTwitter}>
            Jose on <TwitterOutlined style={{ color: colors.twitter }} />
          </Button>
        </Row>
        <Divider />
        <Row>
          <Text>
            If you would like to be notified when we launch, we can send you an
            email!
          </Text>
        </Row>

        <Form
          name="email-subscribe"
          onFinish={onFinish}
          validateMessages={validateMessages}
        >
          <Row justify="space-between" align="middle" gutter={[0, 0]}>
            <Col flex={4}>
              <Form.Item
                name={["email"]}
                rules={[
                  { type: "email", required: true, validator: checkPrice }
                ]}
              >
                <Input placeholder="example@mail.com" />
              </Form.Item>
            </Col>
            <Form.Item>
              <Col flex={1}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Col>
            </Form.Item>
          </Row>
        </Form>

        <Row>
          <Text type="secondary">
            We won&apos;t spam, we don&apos;t even have the ability to send
            emails yet! :)
          </Text>
        </Row>

        <Divider />
        <Row justify="center">
          <Text
            type="secondary"
            style={{ fontSize: ".9rem", textAlign: "center" }}
          >
            {siteIsCurrent}
          </Text>
        </Row>
      </Space>
    </Card>
  );
};
