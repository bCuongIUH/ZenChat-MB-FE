
import React, { useState, useRef, useContext, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import verifiedImage from './verified.gif'; // Import image
import { Auth } from '../../untills/context/SignupContext';
import { postEmail, postValidRegister, removeCookie } from '../../untills/api';
 const OTPConfirmationForm = () => {
    const [isCorrectOTP, setIsCorrectOTP] = useState(false);
    const [otpValues, setOTPValues] = useState(['', '', '', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [showSubmitButton, setShowSubmitButton] = useState(false); 
    const [showError, setShowError] = useState(false); 
    const inputRefs = useRef([]);
    const { data } = useContext(Auth);
    const [announcement, setAnnouncement] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = data.auth;
        if (token && user) {
            navigation.navigate('OTPConfirmationForm');
        } else {
            navigation.navigate('Signup');
        }
    }, [localStorage.getItem("token"), data.auth]);
    useEffect(() => {
      if (showError) {
          const timeout = setTimeout(() => {
              setShowError(false);
          }, 5000);
          return () => clearTimeout(timeout);
      }
  }, [showError]);

  
    const handleInputChange = (index, value) => {
        if (!isNaN(value) && value !== '') {
            const newOTPValues = [...otpValues];
            newOTPValues[index] = value;
            setOTPValues(newOTPValues);

            if (index < otpValues.length - 1) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleBackspace = (event, index) => {
        if (event.nativeEvent.key === 'Backspace' && index >= 0 && index < otpValues.length) {
            const newOTPValues = [...otpValues];
            newOTPValues[index] = '';
            setOTPValues(newOTPValues);

            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handleFocus = (index) => {
        setFocusedIndex(index);
    };

    const handleBlur = () => {
        setFocusedIndex(-1);
    };

    const handleSubmit = async () => {
        if (otpValues.every(val => val !== '' && !isNaN(val))) {
            const validCode = data.auth;
            validCode.code = otpValues.join("");

            try {
                const res = await postValidRegister(validCode);
                if (res.status === 200) {
                    removeCookie();
                    setShowError(false);
                    navigation.navigate('Login');
                } else {
                    navigation.navigate('Signup');
                }
            } catch (error) {
                setShowError(true);
            }
        } else {
            setErrorMessage("");
            setShowError(true);
        }
    };

    const handleSendMail = async () => {
        try {
            const res = await postEmail(data.auth);
            if (res.status === 200) {
                setAnnouncement('Sending email success');
                setShowSubmitButton(true);
            }
        } catch (error) {
            setAnnouncement("Sending email failed");
        }
    };

    return (
        <View style={styles.container}>
            {!isCorrectOTP ? (
                <>
                    <View style={styles.announcement}>{announcement}</View>
                    <View style={styles.thongbao} >
                        <Text style={styles.thongbaoText}>Sign Up Success</Text>
                    </View>
                    <View style={styles.thongbaoEr} >
                        <Text style={styles.thongbaoErText}>Code is incorrect</Text>
                    </View>
                    <Text style={styles.heading}>Verify Account</Text>
                    <Text style={styles.message}>Please enter the 6-digit verification code sent to email {data.auth?.email}</Text>
                    <View style={styles.form}>
                        <View style={styles.otpInputs}>
                            {otpValues.map((value, index) => (
                                <TextInput
                                    key={index}
                                    style={[styles.input, focusedIndex === index && styles.focused]}
                                    value={value}
                                    onChangeText={(text) => handleInputChange(index, text)}
                                    onKeyPress={(event) => handleBackspace(event, index)}
                                    onFocus={() => handleFocus(index)}
                                    onBlur={handleBlur}
                                    ref={(input) => (inputRefs.current[index] = input)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                />
                            ))}
                        </View>
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity style={styles.sendCodeButton} onPress={handleSendMail}>
                                <Text style={styles.buttonText}>Send Code</Text>
                            </TouchableOpacity>
                            {showSubmitButton && (
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <Text style={styles.buttonText}>Submit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {showError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Please enter the full and valid OTP codes</Text>
                        </View>
                    )}
                </>
            ) : (
                <View style={styles.success}>
                    <Text>Verification Successful</Text>
                    <Image source={verifiedImage} style={{ width: 100, height: 100 }} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    announcement: {
        position: 'absolute',
        top: -120,
    },
    thongbao: {
        position: 'absolute',
        top: -60,
    },
    thongbaoText: {
        fontSize: 20,
        color: 'green',
    },
    thongbaoEr: {
        position: 'absolute',
        top: -60,
    },
    thongbaoErText: {
        fontSize: 20,
        color: 'red',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
    },
    form: {
        width: '80%',
    },
    otpInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    input: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 20,
    },
    focused: {
        borderColor: 'blue',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
      
    },
  sendCodeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#ff9903",
    color: "#fff",
    borderWidth: 0,
    cursor: "pointer",
    alignSelf: 'center'
  },
    submitButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'green',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorBox: {
        marginTop: 20,
        backgroundColor: 'pink',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
    success: {
        alignItems: 'center',
    },
});

export {OTPConfirmationForm};
