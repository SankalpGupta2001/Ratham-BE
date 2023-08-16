import User from "../models/StudentModels.js";






const verifyUserAuthentication = async(req, res, next) => {
    const token = (req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
  
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
    req.user = user;
    next();
  };
export{verifyUserAuthentication}

