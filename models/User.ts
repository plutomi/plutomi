import { ObjectId } from 'mongodb';

export default class User {
  constructor(
    public firstName: string,
    public lastName: number,
    public emailVerified: boolean,
    public canReceiveEmails: boolean,
    public totalInvites: number,
    public target: Object[],
    public orgJoinDate?: Date,
    public id?: ObjectId,
  ) {}
}
