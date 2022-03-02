const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const { response } = require('express');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ errors: [{ msg:'There is no profile for this user'} ]});
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error');
    }
})

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private

router.post('/', [ auth, [
    check('profileName', 'ProfileName is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()] 
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        profileName,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    }   = req.body;
    
    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.profileName ) profileFields.profileName = profileName;
    // if (!req.body.profileName) profileFields.profileName = profileName;
if (req.body.company || !req.body.company ) profileFields.company = company;
    // if (!req.body.company) profileFields.company = company;
    if (req.body.website || !req.body.website) profileFields.website = website;
    // if (!req.body.website) profileFields.website = website;
    if (req.body.location || !req.body.location) profileFields.location = location;
    // if (!req.body.location) profileFields.location = location;
    if (req.body.bio || !req.body.bio) profileFields.bio = bio;
    // if (!req.body.bio) profileFields.bio = bio;
    if (req.body.status || !req.body.status) profileFields.status  = status;
    // if (!req.body.status) profileFields.status  = status;
    if (req.body.githubusername || !req.body.githubusername) profileFields.githubusername = githubusername;
    // if (!req.body.githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtsube = youtube;
    // if (!req.body.youtube) profileFields.social.youtsube = youtube;
    if (req.body.twitter) profileFields.social.twitter = twitter;
    // if (!req.body.twitter) profileFields.social.twitter = twitter;
    if (req.body.facebook) profileFields.social.facebook = facebook;
    // if (!req.body.facebook) profileFields.social.facebook = facebook;
    if (req.body.linkedin) profileFields.social.linkedin = linkedin;
    // if (!req.body.linkedin) profileFields.social.linkedin = linkedin;
    if (req.body.instagram) profileFields.social.instagram = instagram;
    // if (!req.body.instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if(profile) {
            profile = await Profile.findOneAndUpdate({user: req.user.id }, {$set: profileFields }, {new : true});
            return res.json(profile);
        };

     // create 
     profile = new Profile(profileFields);
     await profile.save();
     res.json(profile);
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }    
})

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.find({ user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: 'Profile not found'}); }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind== 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });    
        }
        res.status(500).send('Server Error');
    }
})

// @route  DELETE api/profile
// @desc   Delete profile,user and posts
// @access Private

router.delete('/', auth, async (req, res) => {
    try {
        // remove prfile 
        await Profile.findOneAndRemove({ user: req.user.id});
        await User.findOneAndRemove({ _id: req.user.id});
        res.json({ msg: 'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put('/experience', [ 
    auth, 
    [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete profile experience
// @access Private
    router.delete('/experience/:exp_id', auth, async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex,1);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.err(err.message);
            res.status(500).send('Server Error');
            
        }
    })

    // @route  PUT api/profile/education
// @desc   Add profile education
// @access Private
router.put('/education', [ 
    auth, 
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete profile education
// @access Private
    router.delete('/education/:edu_id', auth, async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
            profile.education.splice(removeIndex,1);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.err(err.message);
            res.status(500).send('Server Error');
            
        }
    })

// @route  GET api/profile/github/:username
// @desc   Get user repos from Github
// @access Public

    router.get('/github/:username', (req,res) => {
        try {
            const options = {
                uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
                      sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                      method: 'GET',
                      headers: {'user-agent': 'node.js'}
            }
            request(options, (error, response, body) => {
                if(error) console.error(error);

                if(response.statusCode !== 200) {
                  return  res.status(404).json({ msg: 'No github profile found'});
                }
                res.json(JSON.parse(body))
            })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })

module.exports = router;