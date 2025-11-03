import useEnokiAuthenticationPlatform from "@/hooks/useEnokiAuthenticationPlatform";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function WelcomeAboard() {
  const { saveSecure } = useEnokiAuthenticationPlatform();
  const expoRouter = useRouter();
  const [password, setPassword] = useState({
    v: "",
    e: "",
  });
  const [confirmPassword, setConfirmPassword] = useState({
    v: "",
    e: "",
  });
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleSetupPassword = async () => {
    if (!password.v.trim() || !confirmPassword.v.trim()) return;

    // Reset errors
    setPassword((pv) => ({ ...pv, e: "" }));
    setConfirmPassword((pv) => ({ ...pv, e: "" }));

    // Validate password
    const passwordError = validatePassword(password.v);
    if (passwordError) {
      setPassword((pv) => ({ ...pv, e: passwordError }));
      return;
    }

    // Check if passwords match
    if (password.v !== confirmPassword.v) {
      setConfirmPassword((pv) => ({ ...pv, e: "Passwords do not match" }));
      return;
    }

    try {
      setIsSettingUp(true);

      // TODO: Implement password setup API call
      // For now, just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to login or dashboard after successful setup
      expoRouter.replace("/login");
    } catch (error: any) {
      setPassword((pv) => ({
        ...pv,
        e: "Failed to set up password. Please try again.",
      }));
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <View className="bg-white flex-1">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="items-center mt-20 mb-12">
          <Image
            source={require("../../assets/images/enokiinv.png")}
            className="w-[200px] h-[50px] mb-4"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Section */}
        <View className="mx-6 mb-8">
          <Text className="text-center text-gray-600 font-poppins text-base leading-6 mb-2">
            Since this is your first time using E-Noki, you need to set up your
            account password.
          </Text>
        </View>

        {/* Form */}
        <View className="mx-6">
          <Text className="text-xl font-poppins-semibold text-gray-900 mb-6">
            Create Your Password
          </Text>

          <View className="mb-4">
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
              placeholder="New Password"
              className="bg-slate-50 px-5 h-[60px] rounded-lg border border-slate-200 font-poppins text-black"
            />
            {password.e && (
              <Text className="mt-2 pl-2 font-poppins text-red-600 text-sm">
                {password.e}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <TextInput
              value={confirmPassword.v}
              placeholderTextColor={"#999"}
              onChangeText={(dx) => {
                setConfirmPassword((pv) => ({
                  ...pv,
                  v: dx,
                }));
              }}
              secureTextEntry
              placeholder="Confirm Password"
              className="bg-slate-50 px-5 h-[60px] rounded-lg border border-slate-200 font-poppins text-black"
            />
            {confirmPassword.e && (
              <Text className="mt-2 pl-2 font-poppins text-red-600 text-sm">
                {confirmPassword.e}
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <Text className="font-poppins-semibold text-blue-900 mb-3">
              Password Requirements:
            </Text>
            <Text className="font-poppins text-blue-800 text-sm mb-1">
              • At least 8 characters long
            </Text>
            <Text className="font-poppins text-blue-800 text-sm mb-1">
              • One uppercase letter (A-Z)
            </Text>
            <Text className="font-poppins text-blue-800 text-sm mb-1">
              • One lowercase letter (a-z)
            </Text>
            <Text className="font-poppins text-blue-800 text-sm">
              • One number (0-9)
            </Text>
          </View>

          {/* Setup Button */}
          <Pressable
            className="bg-blue-600 px-8 py-4 rounded-lg mb-8"
            onPress={handleSetupPassword}
            disabled={isSettingUp}
          >
            {isSettingUp ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white font-poppins-semibold text-base ml-2">
                  Setting up...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-poppins-semibold text-base">
                Save and Log Me In
              </Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View className="mx-6 mb-8">
          <Text className="text-center text-slate-500 font-poppins text-sm">
            Made with ❤️ by Apollo @ E-Noki
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
