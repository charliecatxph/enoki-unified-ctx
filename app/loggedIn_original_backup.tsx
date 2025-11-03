import { Pressable, Text, View } from "react-native";

export default function LoggedIn() {
  return (
    <View className="flex-1 bg-yellow-400 p-5">
      <View className="flex-1 bg-blue-600 rounded-lg">
        <View className="mx-auto mt-5 w-2/3 py-2 rounded-full bg-yellow-400 flex items-center justify-center">
          <Text className="text-center text-black font-poppins-semibold">
            Current Status: ABSENT
          </Text>
        </View>
        <View className="mx-5 mt-5 border-t-2 border-neutral-200 pt-5">
          <Text className="text-white text-xl font-poppins-semibold">
            Hello, Charl Concepcion.
          </Text>
          <Text className="text-white  font-poppins">STI College Lucena</Text>
          <Text className="text-white  font-poppins">IT Department</Text>
          <View className="border-t-2 border-neutral-200 mt-5 pt-5">
            <Text className="text-white  font-poppins">Teacher ID: 123456</Text>
            <Text className="text-white  font-poppins">RFID: 123456</Text>
          </View>
        </View>
        <View className="mx-5 mt-5 flex-1 pb-5">
          <Text className="text-white text-xl font-poppins-semibold">
            Actions
          </Text>
          <View className="flex-1 flex flex-col justify-between">
            <View className="mt-5 w-full flex gap-2 flex-col">
              <Pressable className="bg-blue-900 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  Set as Available
                </Text>
              </Pressable>
              <Pressable className="bg-blue-900 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  Set as Busy
                </Text>
              </Pressable>
              <Pressable className="bg-blue-900 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  Set as Break
                </Text>
              </Pressable>
              <Pressable className="bg-blue-900 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  Set as Out
                </Text>
              </Pressable>
            </View>
            <View className="flex gap-2 flex-col">
              <Pressable className="bg-blue-500 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  View Messages
                </Text>
              </Pressable>
              <Pressable className="bg-red-700 rounded-full px-5 py-4 w-full active:border-2 active:border-yellow-400">
                <Text className="font-poppins-semibold text-white text-center">
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
