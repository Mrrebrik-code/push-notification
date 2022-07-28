using OneSignalSDK;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using BestHTTP.SocketIO3;
using System;
using Newtonsoft.Json;

public class OneSingnalManager : MonoBehaviour
{
	private const string _id = "45766648-90ee-4f47-b605-b6692516e371";
	private const string _restApiId = "MDQzZjNlMmMtYmJiOC00ZmQ3LTk3YTItNWE1MTdkMzE5MDhi";
	private string _idUser = "";

	private SocketManager _socketManager = null;
	[SerializeField] private string _address = "http://localhost:52300";
	private bool _isConnected = false;

	private JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings()
	{
		Formatting = Formatting.Indented
	};

	private void Start()
	{
		if (PlayerPrefs.HasKey("user_id") == false)
		{
			_idUser = System.Guid.NewGuid().ToString();
			PlayerPrefs.SetString("user_id", _idUser);
		}
		else
		{
			_idUser = PlayerPrefs.GetString("user_id");
		}

		Debug.Log(_idUser);

		OneSignal.Default.Initialize(_id);
		OneSignal.Default.SetExternalUserId(_idUser);

		if (_socketManager == null || _isConnected == false)
		{

			_socketManager = new SocketManager(new Uri(_address));

			_socketManager.Socket.On(SocketIOEventTypes.Connect, OnConnectToServer);
			_socketManager.Socket.On(SocketIOEventTypes.Disconnect, OnDisconnectToServer);
		}
	}

	[SerializeField] private string _text;
	[SerializeField] private TMPro.TMP_InputField _textTime;
	private void OnDisconnectToServer()
	{
		Debug.Log("Disconnected to server!");
	}

	private void OnConnectToServer()
	{
		Debug.Log("Connected to server!");
	}

	public void Send()
	{
		var tittle = "";
		var bode = _text;
		var url = "https://rxmtgtrpftxiysckdhfs.supabase.co/storage/v1/object/public/push/push-notification-image.png";

		SendNotification(tittle, bode, url);
	}
	public void SendNotification(string tittle, string body, string urlPicture)
	{
		var message = new Message()
		{
			appId = _id,
			apiId = _restApiId,
			userId = _idUser,
			tittle = tittle,
			body = body,
			urlPicture = urlPicture,
			time = _textTime.text
		};

		string json = JsonConvert.SerializeObject(message, _jsonSerializerSettings);

		_socketManager.Socket.Emit("create-notification", json);
	}

	public void ClearNotifications()
	{

	}

	[Serializable]
	public class Message 
	{
		public string appId;
		public string apiId;
		public string userId;
		public string tittle;
		public string body;
		public string urlPicture;
		public string time;
	}

}
