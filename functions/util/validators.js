const isEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return email.match(regex)
}
  
const isEmpty = (string) => string.trim() === ''


exports.validateSignup = newUser => {
    let errors = {}
  
    if (isEmpty(newUser.email)) {
    errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
    }

    if (isEmpty(newUser.password)) {
    errors.password = 'Must not be empty'
    }

    if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Passwords must match'
    }

    if (isEmpty(newUser.handle)) {
    errors.handle = 'Must not be empty'
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}


exports.validateLogin = user => {
    let errors = {}

    if (isEmpty(user.email)) {
      errors.email = 'Must not be empty'
    }
    
    if (isEmpty(user.password)) {
      errors.password = 'Must not be empty'
    }
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}


exports.reduceUserDetails = (data) => {
    let userDetails = {}

    if (!isEmpty(data.bio.trim())) {
        userDetails.bio = data.bio.trim()
    }

    if (!isEmpty(data.website.trim())) {
        if (data.website.trim().substring(0,4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`
        } else {
            userDetails.website = data.website.trim()
        }
    }

    if (!isEmpty(data.location.trim())) {
        userDetails.location = data.location.trim()
    }

    return userDetails

}