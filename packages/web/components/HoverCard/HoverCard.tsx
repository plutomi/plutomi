import { Button, Card, Space, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

// TODO: Add eslint rule to disallow these imports
// import Paragraph from "antd/es/skeleton/Paragraph";

const { Text, Paragraph } = Typography;

export const HoverCard: React.FC = () => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  return visible ? (
    <Card
      title="Hi there!"
      extra={
        <Button type="text" danger onClick={handleClose}>
          Close
        </Button>
      }
      headStyle={{ textAlign: "start" }}
      bodyStyle={{ textAlign: "start" }}
      style={{ width: 500}}
    >
      <Paragraph>
        To enhance the long term stability of the site, I (Jose) am doing a
        major refactor. You can check the progress and all changes on GitHub or
        DM me on Twitter or by email if you have any questions :)
      </Paragraph>
      <Space />
      <Text>jose@plutomi.com</Text>
    </Card>
  ) : null;
};
