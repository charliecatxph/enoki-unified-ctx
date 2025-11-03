import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ForgotPassword() {
  const expoRouter = useRouter();

  const handleBackToLogin = () => {
    expoRouter.replace("/login");
  };

  return (
    <View className="bg-white flex-1 justify-between">
      <View className="flex-1">
        {/* Header with back button */}
        <View className="flex-row items-center px-5 mt-8">
          <Pressable onPress={() => handleBackToLogin()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-poppins-semibold text-slate-700 mr-8">
            Forgot Password
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-2 pt-5 pb-16"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content */}
          <View className="mx-5 mt-5">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="lock-closed" size={32} color="#2563eb" />
              </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-poppins-semibold text-center text-slate-800 mb-4">
              Need your password reset?
            </Text>

            {/* Description */}
            <Text className="text-center text-slate-600 font-poppins leading-6 mb-8">
              For security reasons, password resets must be handled by an E-Noki
              administrator.
            </Text>

            {/* Instructions Card */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <View className="flex-row items-start mb-4">
                <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white font-poppins-semibold text-sm">
                    1
                  </Text>
                </View>
                <Text className="flex-1 text-slate-700 font-poppins">
                  Contact your E-Noki administrator or IT support team
                </Text>
              </View>

              <View className="flex-row items-start mb-4">
                <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white font-poppins-semibold text-sm">
                    2
                  </Text>
                </View>
                <Text className="flex-1 text-slate-700 font-poppins">
                  Provide your registered email address for verification
                </Text>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white font-poppins-semibold text-sm">
                    3
                  </Text>
                </View>
                <Text className="flex-1 text-slate-700 font-poppins">
                  They will reset your password and provide new login
                  credentials
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#d97706" />
                <Text className="ml-2 font-poppins-semibold text-amber-800">
                  Need Help?
                </Text>
              </View>
              <Text className="text-amber-700 font-poppins text-sm">
                If you're unsure who your administrator is, contact your
                school's IT department or the person who provided your E-Noki
                account.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
