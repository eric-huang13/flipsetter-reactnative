import React from 'react';
import {
    Animated,
    Button, Dimensions,
    Image, Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,Vibration,
    StatusBar,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import ActivityLoader from '../../components/ActivityLoader';
import { App, Auth, User } from "../../reducers/actions";
import { connect } from "react-redux";
import { withSocketContext } from "../../components/Socket";

import { Container, Header, Icon, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Title} from 'native-base';
import { withNavigationFocus } from 'react-navigation';
import logo from "../../components/assets/Logo.png";
import NativeStatusBarManager from "react-native/Libraries/Components/StatusBar/NativeStatusBarManager";
import {SafeAreaConsumer} from 'react-native-safe-area-context';
import NavigationService from "../../services/NavigationService";

const window = Dimensions.get('window');
export const IMAGE_HEIGHT = window.width / 2;
export const IMAGE_HEIGHT_SMALL = window.width /6;

class RegisterScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: '',
            last: '',
            email: '',
            password: '',
            verifyPassword: '',
        }
        this.keyboardHeight = new Animated.Value(0);
        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
    }

    componentDidMount(){
        if(Platform.OS === 'android'){
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        }
        else{
            this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide);
        }

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow = (event) => {
        // Animated.parallel([
        //     Animated.timing(this.keyboardHeight, {
        //         duration: event.duration,
        //         toValue: event.endCoordinates.height,
        //     }),
        //     Animated.timing(this.imageHeight, {
        //         duration: event.duration,
        //         toValue: IMAGE_HEIGHT_SMALL,
        //     }),
        // ]).start();
    };

    checkEmailValid(value) {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(value) === true) {
            return false
        }
        else {
            return true
        }
    }

    checkPassword=(value)=>{
    let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    ;
    if (reg.test(value) === true) {
        return false
    }
    else {
        return true
    }
    }

    register = async () => {
        const user = this.state;
        this.setState({ loading: true })
        Vibration.vibrate(1000);
        if (this.state.first === '') {
            this.setState({ loading: false })
            Toast.show('Please enter the First Name', Toast.LONG);
        }
       else if (this.state.last === '') {
            this.setState({ loading: false })
            Toast.show('Please enter the Last Name', Toast.LONG);
        }
        else if (this.state.email === '') {
            this.setState({ loading: false })
            Toast.show('Please enter the Email Address', Toast.LONG);
        }
        else if (this.checkEmailValid(this.state.email)){
            this.setState({ loading: false })
            Toast.show('Please enter Valid Email', Toast.LONG);
        }
        else if (this.state.password === '') {
            this.setState({ loading: false })
            Toast.show('Please enter Password', Toast.LONG);
        }
        else if(this.checkPassword(this.state.password)) {
            this.setState({ loading: false })
            Toast.show('Password must be at least 8 characters long, contain one upper case letter, one lower case letter and (one number OR one special character). May NOT contain spaces', Toast.LONG);
        }
        else if (this.state.verifyPassword === '') {
            this.setState({ loading: false })
            Toast.show('Please enter Verify Password', Toast.LONG);
        }
        else if (this.state.password !== this.state.verifyPassword) {
            this.setState({ loading: false })
            Toast.show('Password not matched', Toast.LONG);
        }
        
        else {
            // first,last,email,pass1,pass2
            let first = this.state.first;
            let last = this.state.last;
            let email = this.state.email;
            let pass1 = this.state.password;
            let pass2 = this.state.verifyPassword;
            let response = await this.props.register(first,last,email,pass1,pass2);
            console.log("SignupRes " +JSON.stringify(response))

            switch (response.type) {
                case "REGISTER_SUCCESS":

                    // this.setState({loading:false,msg: "Please check your email address"});
                    this.setState({loading:false},()=>
                    Toast.show(response.payload.data.message, Toast.LONG),
                    this.props.navigation.goBack()
                    )
                    break;

                case "REGISTER_FAIL":

                    this.setState({loading:false},()=>
                    Toast.show('The email address has already been taken', Toast.LONG)
                    )
                    break;

            }


        }
        
    }

    render() {
        return (
        <Container style={{flex:1}} onStartShouldSetResponder={() => {
            // this.passwordInput.blur(); this.usernameInput.blur();
        
            this.firstInput.isFocused() ? this.firstInput.blur() :
                this.lastInput.isFocused() ? this.lastInput.blur() :
                    this.passwordInput.isFocused() ? this.passwordInput.blur() :
                        this.emailInput.isFocused() ? this.emailInput.blur() :
                            this.passwordInput.isFocused() ? this.passwordInput.blur() :
                                this.verifyPasswordInput.isFocused() && this.verifyPasswordInput.blur()
            ;
        }}>
            <Header style={styles.header} transparent>
                <Left><TouchableOpacity onPress={() => this.props.navigation.goBack()}><Text style={styles.backText}>Back</Text></TouchableOpacity></Left>
                <Body></Body>
                <Right></Right>
            </Header>
            {this.state.loading ? <ActivityLoader/> :null}
            <KeyboardAvoidingView style={[styles.container, {flex:1}]} behavior={(Platform.OS === 'ios') && 'padding'} enabled>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>Register</Text>
                    <Text style={styles.backText}>with FlipSetter</Text>
                    <Text style={styles.error}>{this.state.msg}</Text>
                </View>
                <TextInput
                    value={this.state.first}
                    onChangeText={(first) => this.setState({ first })}
                    placeholder={'First Name'}
                    placeholderTextColor={'#919191'}
                    style={styles.input}
                    textContentType={'givenName'}
                    ref={(input) => this.firstInput = input}
                    onSubmitEditing={() => {this.lastInput.focus();}}
                    blurOnSubmit={false}
                />
                <TextInput
                    value={this.state.last}
                    onChangeText={(last) => this.setState({ last })}
                    placeholder={'Last Name'}
                    placeholderTextColor={'#919191'}
                    style={styles.input}
                    textContentType={'familyName'}
                    ref={(input) => this.lastInput = input}
                    onSubmitEditing={() => {this.emailInput.focus();}}
                    blurOnSubmit={false}
                />
                <TextInput
                    value={this.state.email}
                    onChangeText={(email) => this.setState({ email })}
                    placeholder={'Email'}
                    placeholderTextColor={'#919191'}
                    style={styles.input}
                    autoCompleteType={'email'}
                    textContentType={'username'}
                    ref={(input) => this.emailInput = input}
                    onSubmitEditing={() => {this.passwordInput.focus();}}
                    blurOnSubmit={false}
                />
                <TextInput
                    value={this.state.password}
                    onChangeText={(password) => this.setState({ password })}
                    placeholder={'Password'}
                    placeholderTextColor={'#919191'}
                    style={styles.input}
                    textContentType={'newPassword'}
                    secureTextEntry={true}
                    ref={(input) => this.passwordInput = input}
                    onSubmitEditing={() => {this.verifyPasswordInput.focus();}}
                    blurOnSubmit={false}
                />
                <TextInput
                    value={this.state.verifyPassword}
                    onChangeText={(verifyPassword) => this.setState({ verifyPassword })}
                    placeholder={'Confirm Password'}
                    placeholderTextColor={'#919191'}
                    style={styles.input}
                    textContentType={'newPassword'}
                    secureTextEntry={true}
                    ref={(input) => this.verifyPasswordInput = input}
                    onSubmitEditing={this.register}
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    title={'Register'}
                    onPress={this.register}
                    style={styles.loginButton}
                    underlayColor='#04b600'
                >
                    <Text style={[styles.backText,{fontSize:20}]}>Register</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Container>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25422e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        backgroundColor: '#25422e',
    },
    backText:{
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white'
    },
    error: {
        color: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo:{
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText:{
        fontSize:25,
        marginTop:10,
        color:'#ffffff',

    },
    signup:{
        fontSize:15,
        marginTop:15,
    },
    input: {
        width: 300,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 10,
        textAlign:'center',
        color: '#000',

    },
    loginButton: {
        height:30,
        width:100,
        borderRadius:15,
        alignItems:'center',
        justifyContent: 'center',
        color:'#000',
        backgroundColor: "#25422e",
        marginTop: 25,
    },

});



const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        app: state.app,
        user: state.user,
    }
}

const mapDispatchToProps = {
   
    register: Auth.register,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSocketContext(withNavigationFocus(RegisterScreen)))