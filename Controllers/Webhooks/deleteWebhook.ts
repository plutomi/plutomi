import { Request, Response } from 'express';
import { Org } from '../../entities/Org';
import { Webhook } from '../../entities/Webhooks';

export const deleteWebhook = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const webhook = await Webhook.findById(req.params.webhookId, {
      org: user.org,
    });

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook no longer exists' });
    }

    try {
      await Webhook.deleteOne({
        _id: webhook._id,
        org: user.org,
      });

      try {
        await Org.updateOne(
          {
            _id: user.org,
          },
          {
            $inc: {
              totalWebhooks: -1,
            },
          },
        );
        return res.status(200).json({ message: 'Webhook deleted!' });
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'Webhook deleted but unable to decrement webhook count on org' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Unable to delete webhook from org' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving webhook info' });
  }
};
