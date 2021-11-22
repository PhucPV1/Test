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
          options.onSubmit(outputValues)
          // submit with html default
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
            case options.password_Name:
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
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    check: function (value) {
      var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      return regexEmail.test(value) ? undefined : message || "Please enter a valid email"
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
