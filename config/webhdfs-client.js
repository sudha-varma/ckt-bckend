// Include webhdfs module
import WebHDFS from "webhdfs";

// Create a new
const hdfs = WebHDFS.createClient({
  user: "hadoopuser", // Hadoop user
  host: "10.2.200.2", // Namenode host
  port: 50070, // Namenode port
  path: "/webhdfs/v1/",
});

export default hdfs;
