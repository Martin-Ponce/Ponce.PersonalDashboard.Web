import { ProfilePicture } from '../../constants/profile.constants';

export interface UserProfile {
  name: string;
  picture: ProfilePicture;
  imageUrl?: string;
  online: boolean;
}
