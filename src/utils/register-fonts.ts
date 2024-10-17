import { Font } from '@react-pdf/renderer';
import RobotoRegular from '@/assets/fonts/Roboto-Regular.ttf';
import RobotoBold from '@/assets/fonts/Roboto-Bold.ttf';

export const registerFonts = () => {
  Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: RobotoRegular,
      },
      {
        src: RobotoBold,
        fontWeight: 'bold',
      },
    ],
  });
};
