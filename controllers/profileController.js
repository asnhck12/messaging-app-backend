require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');


exports.getMyProfile = asyncHandler(async(req,res,next) => { 
    const userId = parseInt(req.userId, 10);
    
    try { 
        const profile = await prisma.profile.findUnique({
            where: {
              userId: userId,
            },
            select: {
              firstName: true,
              surName: true,
              profileSummary: true,
              user: {
                select:{
                  username:true,
                  isGuest: true
                }
              }
            }
          });

          if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
          }

          const result = {
            ...profile,
            username: profile.user.username,
            isGuest: profile.user.isGuest
          };
          delete result.user;
      
          res.json(result);
        } catch (error) {
          next(error);
        }
      });

exports.getProfile = asyncHandler(async(req,res,next) => { 
    const { userId } = req.params;
    try { 
        const profile = await prisma.profile.findUnique({
            where: {
              userId: parseInt(userId),
            },
            select: {
              firstName: true,
              surName: true,
              profileSummary: true,
              user: {
                select:{
                  username: true
                }
              }
            }
          });

          if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
          }
      
          res.json(profile);
        } catch (error) {
          next(error);
        }
      });

exports.updateProfile = asyncHandler(async (req, res, next) => {
    const {firstname, surname, summary} = req.body;
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ error: "No users selected." });
      }
      
      try {
            await prisma.Profile.update({
                where: {
                    userId: userId
                },
                data: {
                    firstName: firstname,
                    surName: surname,
                    profileSummary: summary,
                },
        });

        res.status(201).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });