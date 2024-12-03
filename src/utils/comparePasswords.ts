import bcrypt from 'bcryptjs';

const comparePasswords = async (password: string, userPassword: string) => {
  return await bcrypt.compare(password, userPassword);
};

export default comparePasswords;
