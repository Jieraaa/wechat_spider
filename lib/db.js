var Sequelize = require('sequelize');

const sequelize = new Sequelize('wechat', 'root', '1234', {
	host: '127.0.0.1',
	dialect: 'mysql',
});

var Post = sequelize.define('Post', {
	biz: Sequelize.STRING, //每个账号的唯有标记，base64
	appmsgid: Sequelize.STRING, //每个账号一个文章的 ID，注意，这里不是全局唯一的，多个账号可能重复
	accountName: Sequelize.STRING, //公众号名称，比如 赤兔金马奖
	author: Sequelize.STRING, //作者名称，比如 金马
	title: Sequelize.STRING,
	cover: Sequelize.STRING,
	contentUrl: {type: Sequelize.STRING, unique: true},
	digest: Sequelize.TEXT,
	idx: Sequelize.INTEGER, //多篇文章的时候的排序，第一篇是 1，第二篇是 2
	sourceUrl: Sequelize.STRING,
	createTime: Sequelize.DATE,
	readNum: {type: Sequelize.INTEGER, defaultValue: 0}, //阅读数
	likeNum: {type: Sequelize.INTEGER, defaultValue: 0}, //点赞数
	rewardNum: {type: Sequelize.INTEGER, defaultValue: 0}, //赞赏数
	electedCommentNum: {type: Sequelize.INTEGER, defaultValue: 0}, //选出来的回复数
	flag: Sequelize.INTEGER,
}, {
	tableName: 'xsjbh_wangjing'
});

var insertOne = function (author, biz, appmsgid, title, contentUrl, cover, digest, idx, sourceUrl, createTime) {
	sequelize.sync().then(function () {
		return Post.create({
			author: author,
			biz: biz,
			appmsgid: appmsgid,
			title: title,
			contentUrl: contentUrl.replace(/\\\//g, "/"),
			cover: cover.replace(/\\\//g, "/"),
			digest: digest.replace("&nbsp;", " "),
			idx: idx,
			sourceUrl: sourceUrl.replace(/\\\//g, "/"),
			createTime:createTime,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}).then(function (post) {
	}).catch(function (error) {
		console.log("Insert failed: " + error);
	});
};

var updateOne = function (biz, appmsgid, idx, updateObject) {
	return Post.update(
		updateObject,
		{
			where: {
				biz: biz,
				appmsgid: appmsgid,
				idx: idx
			}
		}
	).then(function () {
		// console.log("update count success");
	}).catch(function (error) {
		console.log("Update failed: " + error);
	});
};

var deleteOne = function (biz, appmsgid, idx) {
	Post.destroy({
		where: {
			biz: biz,
			appmsgid: appmsgid,
			idx: idx
		}
	})
		.then(function () {
		// console.log("update count success");
	}).catch(function (error) {
		console.log("delete failed: " + error);
	});
};

var updateOneById = function (id, updateObject) {
	return Post.update(
		updateObject,
		{
			where: {
				id: id,
			}
		}
	).then(function () {
		// console.log("update count success");
	}).catch(function (error) {
		console.log("Update failed: " + error);
	});
};

var all = function () {
	return Post.findAll();
};

var getNextUnupdatedPostContentUrl = function (appmsgid, nonce, callback) {
	return Post.findOne({
		where: {
			flag: 0,
      appmsgid: {
        $ne: appmsgid
      },
			contentUrl:{
				$ne: ''
			},
			createTime:{
				$gt: '2014-06-01 00:00:00'
			}
		}
	})
		.then(function (post) {
			var contentUrl = 'https://www.lijinma.com/wechat_spider.html';
			if (post) {
				contentUrl = post.contentUrl;
				Post.update({flag: 1},
					{
						where: {
							id: post.id
						}
					})
						}
      callback(contentUrl, nonce);
		});
}


module.exports = {
	insertOne: insertOne,
	updateOne: updateOne,
	deleteOne: deleteOne,
	all: all,
	getNextUnupdatedPostContentUrl: getNextUnupdatedPostContentUrl,
};
