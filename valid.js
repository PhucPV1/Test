function Validator(options) {
  function getParent(element, targetElement) {
    while (element.parentElement) {
      if (element.parentElement.matches(targetElement)) {
        return element.parentElement
      }
      element = element.parentElement
    }
  }
  var allRules = {}
  /* validate function */
  function validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
    var errorMessage
    // get rule for selector
    var rules = allRules[rule.selector]
    // loop each rules and check, if have error message -> stop check
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"))
          break
        default:
          errorMessage = rules[i](inputElement.value)
      }
      if (errorMessage) break
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage
      getParent(inputElement, options.formGroupSelector).classList.add("invalid")
    } else {
      errorElement.innerText = ""
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
    }
    return !errorMessage
  }
  /* get element from form */
  var formElement = document.querySelector(options.idForm)
  if (formElement) {
    // submit form
    formElement.onsubmit = (e) => {
      e.preventDefault()
      var isFormValid = true

      options.rules.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector)
        var isValid = validate(inputElement, rule)
        if (!isValid) {
          isFormValid = false
        }
      })
      if (isFormValid) {
        // submit with js
        if (typeof options.onSubmit === "function") {
          var validInputs = formElement.querySelectorAll("[name]:not([disabled])")
          var outputValues = Array.from(validInputs).reduce(function (values, input) {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(`input[name= ${input.name}]:checked`).value
                break
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = ""
                  return values
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = []
                }
                values[input.name].push(input.value)
                break
              case "file":
                values[input.name] = input.files
                break
              default:
                values[input.name] = input.value
            }
            return values
          }, {})
          if (options.captchaRequired == "no") {
            options.onSubmit(outputValues)
          } else {
            if (recaptcha_response) {
              options.onSubmit(outputValues)
            } else {
              errorFormGroupCaptcha.classList.add("invalid")
              formMessageElement.innerText = options.captchaErrorMessage
            }
          }
          // submit with default html
        } else {
          formElement.submit()
        }
      }
    }
    // loop all input element
    options.rules.forEach((rule) => {
      // save all rules
      if (Array.isArray(allRules[rule.selector])) {
        allRules[rule.selector].push(rule.check)
      } else {
        allRules[rule.selector] = [rule.check]
      }
      var inputElements = formElement.querySelectorAll(rule.selector)
      Array.from(inputElements).forEach(function (inputElement) {
        //   when blur
        inputElement.onblur = () => {
          validate(inputElement, rule)
        }
        //   when input
        inputElement.oninput = () => {
          var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
          errorElement.innerText = ""
          getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
        }

        inputElement.onchange = () => {
          switch (inputElement.name) {
            //when change select-options
            case options.selectOption_Name:
              options.rules.forEach(() => {})
              validate(inputElement, rule)
              break
            // auto validate confirm password when changing password
            case options.passwordName:
              validate(
                formElement.querySelector(options.passwordConfirmationSelector),
                Validator.isConfirmPassword(options.passwordConfirmationSelector)
              )
              break
            default:
              break
          }
        }
      })
    })
  }
  var captchaElement = document.querySelector(".g-recaptcha")
  var errorFormGroupCaptcha = getParent(captchaElement, options.formGroupSelector)
  var formMessageElement = errorFormGroupCaptcha.querySelector(options.errorSelector)
}
/* Rules */
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      return value ? undefined : message || "This is a required field"
    },
  }
}
Validator.isName = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      var regexName =
        /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/iu
      return regexName.test(value) ? undefined : message || "Please enter a valid name"
    },
  }
}
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      return regexEmail.test(value) ? undefined : message || "Please enter a valid email"
    },
  }
}
Validator.isPhoneNumber = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      var regexPhone = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/
      return regexPhone.test(value) ? undefined : message || "Please enter a valid email"
    },
  }
}
Validator.isAddress = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      var regexAddress =
        /^[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:[ \/\-]*[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/iu
      return regexAddress.test(value) ? undefined : message || "Please enter a valid address"
    },
  }
}
Validator.isMinLength = function (selector, min, message) {
  return {
    selector: selector,
    check: function (value) {
      return value.length >= min ? undefined : message || `Please enter a password longer than ${min} characters `
    },
  }
}
Validator.isConfirmPassword = function (selector, checkConfirm, message) {
  return {
    selector: selector,
    check: function (value) {
      return value === checkConfirm() ? undefined : message || `Please re-enter the matching password`
    },
  }
}
/* Validate google captcha */
var recaptcha_response = false
function validateCaptcha() {
  recaptcha_response = true
  var errorFormGroupCaptcha = document.querySelector(".g-recaptcha").parentElement
  var formMessageElement = errorFormGroupCaptcha.querySelector(".form-message")
  errorFormGroupCaptcha.classList.remove("invalid")
  formMessageElement.innerText = ""
}

/* ================================================================================================= */

Validator({
  idForm: "#form",
  formGroupSelector: ".form-group",
  errorSelector: ".form-message",
  passwordSelector: "#password",
  passwordConfirmationSelector: "#password_confirmation",
  passwordName: "password",
  // selectOption_Name: "province",
  captchaRequired: "yes",
  rules: [
    Validator.isRequired("#fullname", "Họ và tên không được để trống"),
    Validator.isRequired("#email", "Email không được để trống"),
    Validator.isRequired("#phone_number", "Số điện thoại không được để trống"),
    Validator.isRequired("#password", "Mật khẩu không được để trống"),
    Validator.isRequired("#password_confirmation", "Vui lòng xác nhận lại mật khẩu"),
    //   Validator.isRequired("#province"),
    // Validator.isRequired("input[name='gender']"),
    // Validator.isRequired("#avatar"),
    Validator.isName("#fullname", "Vui lòng nhập lại họ và tên hợp lệ"),
    Validator.isEmail("#email", "Vui lòng nhập lại email hợp lệ"),
    Validator.isPhoneNumber("#phone_number", "Vui lòng nhập lại số điện thoại hợp lệ "),
    // Validator.isAddress("#address"),
    Validator.isMinLength("#password", 6, "Vui lòng nhập lại mật khẩu độ dài trên 6 ký tự"),
    Validator.isConfirmPassword(
      "#password_confirmation",
      () => {
        return document.querySelector("#form #password").value
      },
      "Vui lòng nhập lại password trùng khớp"
    ),
  ],
  captchaErrorMessage: "Vui lòng nhập captcha",
  onSubmit: function (data) {
    // Post method API
    var api = "http://localhost:3000/users"
    var options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
    fetch(api, options)
      .then((response) => response.json())
      .then(() => {
        alert("Tài khoản của bạn đã được tạo thành công, sẽ được chuyển sang trang đăng nhập")
        window.location = "../login"
      })
  },
})
