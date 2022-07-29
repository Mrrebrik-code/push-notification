using OneSignalSDK;
using UnityEngine;
using BestHTTP.SocketIO3;
using System;
using Newtonsoft.Json;

namespace Itibsoft.Push
{
	public class PushNotification : MonoBehaviour
	{
		[SerializeField] private string _address = "http://localhost:52300";
		private SocketManager _socketManager = null;
		private bool _isConnected = false;

		private const string _id = "45766648-90ee-4f47-b605-b6692516e371";
		private string _idUser = "";

		private JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings() { Formatting = Formatting.Indented };

		private void Start()
		{
			if (PlayerPrefs.HasKey("user_id") == false)
			{
				_idUser = Guid.NewGuid().ToString();
				PlayerPrefs.SetString("user_id", _idUser);
			}
			else
			{
				_idUser = PlayerPrefs.GetString("user_id");
			}

			OneSignal.Default.Initialize(_id);
			OneSignal.Default.SetExternalUserId(_idUser);

			if (_socketManager == null || _isConnected == false)
			{
				_socketManager = new SocketManager(new Uri(_address));

				_socketManager.Socket.On(SocketIOEventTypes.Connect, OnConnectToServer);
				_socketManager.Socket.On(SocketIOEventTypes.Disconnect, OnDisconnectToServer);
			}
		}

		private void OnDisconnectToServer()
		{
			Debug.Log("Disconnected to server!");
		}

		private void OnConnectToServer()
		{
			Debug.Log("Connected to server!");
		}

		public void SendNotification(string body, string urlPicture, string time)
		{
			var message = new Message()
			{
				userId = _idUser,
				body = body,
				urlPicture = urlPicture,
				time = time
			};

			string json = JsonConvert.SerializeObject(message, _jsonSerializerSettings);

			_socketManager.Socket.Emit("create-notification", json);
		}

		public void ClearNotifications()
		{
			AbstractMessage message = new UserId() { userId = _idUser };
			var json = JsonConvert.SerializeObject(message, _jsonSerializerSettings);
			_socketManager.Socket.Emit("clear-notification", json);
		}

		[Serializable]
		public class Message : AbstractMessage
		{
			public string userId;
			public string body;
			public string urlPicture;
			public string time;
			public string idNotification;

			public Message()
			{
				idNotification = Guid.NewGuid().ToString();
			}
		}

		[Serializable]
		public class UserId : AbstractMessage
		{
			public string userId;
		}

		public abstract class AbstractMessage { }

	}
}

