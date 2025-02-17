---
title: 如何在 Java 中连接 S3 及其兼容服务
tags:
  - java
  - s3
date: 2024-11-21 16:19:19
---

所谓 S3，指的是 Amazon Simple Storage Service，即 “亚马逊简单存储服务”。比起直接将文件直接存储在本地，将文件存储到专门的服务中有许多优点。本文演示了如何在 Java 中连接 S3 及其兼容服务。

<!--more-->

## 什么是 S3 及其兼容服务 & 为什么要使用它

S3 指的是 [Amazon Simple Storage Service](https://aws.amazon.com/s3/)。它是由亚马逊提供的一个对象存储服务。简单地理解，对象就是文件。您希望将一部分文件存储起来，能够以某种方式随意操作它，但又不希望手动地管理存储这些文件的细节。借助 S3，您不需要考虑文件到底存在哪里、存储容量不够了怎么办、如何确保内容的安全性、如何确保文件不丢失等等问题，只需要专注于您的核心诉求 —— 存取一些文件。

除了 Amazon，很多其他服务商也提供了类似的对象存储服务，例如 [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)，[阿里云 OSS](https://cn.aliyun.com/product/oss)，[腾讯云 COS](https://cloud.tencent.com/product/cos) 等。此外，还有诸如 [MinIO](https://min.io/) 这样支持自部署的对象存储服务。

尽管这类服务种类繁多，但由于 AWS 在云计算领域的 “老大哥” 地位，S3 已经成为事实上的对象存储服务标准。所以，您只需要基于 AWS S3 SDK 编写您的业务，就可以快速接入任一支持 S3 API 的对象存储服务，并在有需要时快速切换服务。

## 如何在 Java 中使用它

首先，添加 AWS S3 的 Java SDK。如果您使用 Apache Maven，将下面的内容添加到 `pom.xml`：

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.29.18</version>
</dependency>
```

对于 Gradle，将下面的内容添加到 `build.gradle`：

```gradle
implementation 'software.amazon.awssdk:s3:2.29.18'
```

接着，创建服务类。下面是一个服务类示例。

注意代码中的以下 5 个 S3 配置信息：

- `endpoint`：S3 及其兼容服务的端点
- `bucketName`：存储桶名称
- `region`：区域
- `accessKeyId`：访问密钥 ID
- `secretAccessKey`：机密访问密钥

您应该妥善地保管其中的密钥信息。但为了方便演示，此处直接写进了源代码。

关于如何获取这些信息，取决于您所选用的具体的 S3 服务。这里提供一个对于 Cloudflare R2 的参考：[Cloudflare R2 逐步指南 | S3 Image Port Docs](https://docs.iport.yfi.moe/zh/guide/for-cloudflare-r2)。对于其他服务，请自行查阅相关文档。

> [!Tip]
> 此处的 [S3 Image Port](https://iport.yfi.moe/) 是我朋友的一个项目，旨在将 S3 存储用作图床。我为这个项目贡献了代码，并编写了上面的逐步指南，可以帮助您一步一步查找上面所需的 5 个配置信息。

另一个需要注意的关键点是 `pathStyleAccessEnabled(true)`：

```java
S3Configuration s3Configuration = S3Configuration.builder()
    .pathStyleAccessEnabled(true) // Use path-style access for compatibility with MinIO
    .build();
```

对于一些特定的 S3 兼容服务（例如 [MinIO](https://min.io/)），您需要启用这个选项。

```java
@Service public class OssService {
  private static final Logger logger = LoggerFactory.getLogger(OssService.class);
  private String endpoint = "...";
  private String bucketName = "...";
  private String region = "...";
  private String accessKeyId = "...";
  private String secretAccessKey = "...";

  private S3Client s3Client;

  @PostConstruct
  public void init() {
    if (endpoint.isEmpty() || bucketName.isEmpty()) {
      logger.error("Endpoint or bucket name is not configured properly.");
      throw new IllegalStateException("S3 configuration is incomplete.");
    }

    AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

    S3Configuration s3Configuration = S3Configuration.builder()
        .pathStyleAccessEnabled(true) // Use path-style access for compatibility with MinIO
        .build();

    s3Client = S3Client.builder()
        .endpointOverride(URI.create(endpoint))
        .region(Region.of(region))
        .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
        .serviceConfiguration(s3Configuration)
        .build();

    logger.info("S3Client initialized with endpoint: {} and bucket: {}", endpoint, bucketName);
  }

  @PreDestroy
  public void shutdown() {
    if (s3Client != null) {
      s3Client.close();
      logger.info("S3Client shutdown.");
    }
  }

  public void uploadFile(String objectName, InputStream inputStream) throws Exception {
    logger.info("Uploading file: {}", objectName);
    s3Client.putObject(PutObjectRequest.builder()
        .bucket(bucketName)
        .key(objectName)
        .build(),
        RequestBody.fromInputStream(inputStream, inputStream.available()));
  }

  public InputStream downloadFile(String objectName) {
    logger.info("Downloading file: {}", objectName);
    ResponseInputStream<GetObjectResponse> response = s3Client.getObject(GetObjectRequest.builder()
        .bucket(bucketName)
        .key(objectName)
        .build());
    return response;
  }

  public List<String> listFiles(String keyPrefix) {
    logger.info("Listing files with prefix: {}", keyPrefix);
    ListObjectsV2Response response = s3Client.listObjectsV2(ListObjectsV2Request.builder()
        .bucket(bucketName)
        .prefix(keyPrefix)
        .build());

    return response.contents().stream()
        .map(S3Object::key)
        .map(key -> {
          String[] parts = key.split("/");
          return parts[parts.length - 1];
        })
        .toList();
  }

  public void deleteFile(String objectName) {
    logger.info("Deleting file: {}", objectName);
    s3Client.deleteObject(DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(objectName)
        .build());
  }
}
```

## 参考资料

- [MinIO Docs](https://min.io/docs)
- [S3 API compatibility | Cloudflare R2 docs](https://developers.cloudflare.com/r2/api/s3/api/)
- [Transfer files and directories with the Amazon S3 Transfer Manager - AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html)
- [使用 AWS S3 SDK 访问 COS - 腾讯云](https://cloud.tencent.com/document/product/436/37421)
- [使用 Amazon S3 SDK 访问 OSS - 阿里云](https://www.alibabacloud.com/help/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss)
