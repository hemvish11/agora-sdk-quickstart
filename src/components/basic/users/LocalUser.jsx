const LocalUser = ({ audioTrack, cameraOn, micOn, videoTrack }) => {
  const localVideoRef = useRef();

  useEffect(() => {
    if (cameraOn && videoTrack) {
      videoTrack.play(localVideoRef.current);
    }
  }, [cameraOn, videoTrack]);

  return (
    <div>
      <div ref={localVideoRef} style={{ width: "400px", height: "300px", backgroundColor: "black" }}></div>
    </div>
  );
};
export default LocalUser;