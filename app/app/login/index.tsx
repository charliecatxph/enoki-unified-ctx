import { useAuth } from "@/components/AuthContext";
import useEnokiAuthenticationPlatform from "@/hooks/useEnokiAuthenticationPlatform";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const { saveSecure, fetchSecure, removeSecure } =
    useEnokiAuthenticationPlatform();
  const { __login } = useAuth();
  const expoRouter = useRouter();
  const [email, setEmail] = useState({
    v: "",
    e: "",
  });
  const [password, setPassword] = useState({
    v: "",
    e: "",
  });
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!email.v.trim() || !password.v.trim()) return;

    setEmail((pv) => ({
      ...pv,
      e: "",
    }));
    setPassword((pv) => ({
      ...pv,
      e: "",
    }));

    try {
      setIsSigningIn(true);
      await __login(email.v, password.v);
    } catch (error: any) {
      if (error?.response) {
        if (error.response.data.code === "USER_NOT_FOUND") {
          setEmail((pv) => ({
            ...pv,
            e: "User not found",
          }));
        } else if (error.response.data.code === "INVALID_CREDENTIALS") {
          setPassword((pv) => ({
            ...pv,
            e: "Invalid credentials",
          }));
        }
      }
    } finally {
      setIsSigningIn(false);
      setPassword((pv) => ({
        ...pv,
        v: "",
      }));
    }
  };

  return (
    <View className=" bg-white flex-1 justify-between">
      <View>
        <Image
          source={require("../../assets/images/enokiinv.png")}
          className="w-[200px] h-[50px] mt-[100px] mx-auto"
          resizeMode="contain"
        />
        <Text className="text-center mt-10 text-slate-500 font-poppins">
          Teacher Management Console
        </Text>
        <View className="mx-5 flex flex-col gap-3 mt-10">
          <TextInput
            value={email.v}
            placeholderTextColor={"#999"}
            onChangeText={(dx) => {
              setEmail((pv) => ({
                ...pv,
                v: dx,
              }));
            }}
            placeholder="E-Mail Address"
            className="bg-slate-50 px-5 h-[70px] rounded-md border border-slate-200 font-poppins text-black"
          />
          {email.e && (
            <Text className="pl-5 font-poppins-semibold text-red-600 text-sm">
              {email.e}
            </Text>
          )}
          <TextInput
            value={password.v}
            placeholderTextColor={"#999"}
            onChangeText={(dx) => {
              setPassword((pv) => ({
                ...pv,
                v: dx,
              }));
            }}
            secureTextEntry
            placeholder="Password"
            className="bg-slate-50 px-5 h-[70px] rounded-md border border-slate-200 font-poppins text-black"
          />
          {password.e && (
            <Text className="pl-5 font-poppins-semibold text-red-600 text-sm">
              {password.e}
            </Text>
          )}
        </View>
        <View className="mx-5 mt-10">
          <Pressable
            className="bg-blue-600 px-8 py-6 rounded-full"
            onPress={handleSubmit}
          >
            {isSigningIn && <ActivityIndicator size="small" color="#FFFFFF" />}
            {!isSigningIn && (
              <Text className="text-white text-center font-poppins-semibold">
                Login
              </Text>
            )}
          </Pressable>
          <Pressable
            className="mt-10"
            onPress={() => expoRouter.push("/forgot-password")}
          >
            <Text className="text-blue-600 text-center font-poppins-semibold">
              Forgot your password?
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="mx-5">
        <Text className="text-center text-slate-500 font-[500] pb-5 text-sm font-poppins">
          Made with ❤️ by Apollo @ E-Noki
        </Text>
      </View>
    </View>
  );
}
